import {initializeApp} from "firebase-admin/app";
import {
  getFirestore,
} from "firebase-admin/firestore";
import {
  getMessaging,
  type FidMulticastMessage,
} from "firebase-admin/messaging";
import {setGlobalOptions} from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: "europe-west1",
});

const db = getFirestore();

const BREVO_API_KEY =
  defineSecret("BREVO_API_KEY");

type TefilaData = {
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  status?: string;
};

type UserData = {
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  countsForMinyan?: boolean;
  notificationPreferences?: {
    tfilot?: boolean;
  };
};

type PushRegistrationData = {
  installationId?: string;
  userId?: string;
  enabled?: boolean;
};

type TefilaRegistrationData = {
  userId?: string;
  attending?: boolean;
  guestCount?: number;
};

type PushRecipient = {
  documentId: string;
  fid: string;
};

type SendResult = {
  recipients: number;
  successCount: number;
  failureCount: number;
};

export const notifyAdminNewAppAccount =
  onDocumentCreated(
    {
      document: "users/{userId}",
      secrets: [BREVO_API_KEY],
    },
    async (event) => {
      const user =
        event.data?.data() as
          UserData | undefined;

      if (!user) {
        return;
      }

      /*
       * Bara riktiga väntande kontoansökningar.
       * Om ett dokument skapas direkt som approved
       * ska inget adminmejl skickas.
       */
      if (user.status !== "pending") {
        return;
      }

      const name =
        user.name?.trim() ||
        "Okänd användare";

      const email =
        user.email?.trim() || "";

      const htmlContent = `
        <!doctype html>
        <html lang="sv">
          <body style="
            margin:0;
            padding:0;
            background:#f8fafc;
            font-family:Arial,sans-serif;
            color:#1e293b;
          ">
            <div style="
              max-width:560px;
              margin:0 auto;
              padding:32px 20px;
            ">
              <div style="
                background:#ffffff;
                border-radius:20px;
                padding:32px;
                border:1px solid #e2e8f0;
              ">
                <div style="
                  color:#183b70;
                  font-size:14px;
                  font-weight:700;
                  margin-bottom:8px;
                ">
                  ADAT JISRAEL
                </div>

                <h1 style="
                  margin:0 0 20px;
                  color:#183b70;
                  font-size:26px;
                  line-height:1.25;
                ">
                  Ny kontoansökan
                </h1>

                <p style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 16px;
                ">
                  ${escapeHtml(name)} har ansökt om
                  ett konto i Adat Jisrael-appen.
                </p>

                ${
                  email
                    ? `
                      <p style="
                        font-size:15px;
                        line-height:1.7;
                        margin:0 0 24px;
                        color:#475569;
                      ">
                        E-post:
                        <strong>
                          ${escapeHtml(email)}
                        </strong>
                      </p>
                    `
                    : ""
                }

                <a
                  href="https://app.adatjisrael.se/"
                  style="
                    display:inline-block;
                    background:#183b70;
                    color:#ffffff;
                    text-decoration:none;
                    font-weight:700;
                    padding:13px 20px;
                    border-radius:12px;
                  "
                >
                  Öppna Adat Jisrael
                </a>

                <p style="
                  font-size:14px;
                  line-height:1.6;
                  color:#64748b;
                  margin:28px 0 0;
                ">
                  Logga in i administrationen för
                  att granska ansökan.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response =
        await fetch(
          "https://api.brevo.com/v3/smtp/email",
          {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key":
                BREVO_API_KEY.value(),
              "content-type":
                "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "Adat Jisrael",
                email:
                  "info@adatjisrael.se",
              },
              to: [
                {
                  email:
                    "info@adatjisrael.se",
                  name: "Adat Jisrael",
                },
              ],
              subject:
                "Ny kontoansökan i Adat Jisrael-appen",
              htmlContent,
            }),
          },
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        logger.error(
          "Brevo kunde inte skicka adminmejl",
          {
            userId: event.params.userId,
            status: response.status,
            response: errorText,
          },
        );

        throw new Error(
          `Brevo svarade ${response.status}`,
        );
      }

      const result =
        await response.json() as {
          messageId?: string;
        };

      logger.info(
        "Adminmejl om ny kontoansökan skickat",
        {
          userId: event.params.userId,
          messageId:
            result.messageId ?? null,
        },
      );
    },
  );

export const notifyApprovedAppAccount =
  onDocumentUpdated(
    {
      document: "users/{userId}",
      secrets: [BREVO_API_KEY],
    },
    async (event) => {
      const before =
        event.data?.before.data() as
          UserData | undefined;

      const after =
        event.data?.after.data() as
          UserData | undefined;

      if (!before || !after) {
        return;
      }

      /*
       * Skicka bara när kontot går FRÅN
       * något annat läge TILL approved.
       *
       * Senare profiländringar på ett redan
       * godkänt konto skickar alltså inget nytt mejl.
       */
      if (
        before.status === "approved" ||
        after.status !== "approved"
      ) {
        return;
      }

      const email =
        after.email?.trim();

      const name =
        after.name?.trim() ||
        "Hej";

      if (!email) {
        logger.error(
          "Godkänt konto saknar mejladress",
          {
            userId: event.params.userId,
          },
        );

        return;
      }

      const firstName =
        name === "Hej"
          ? ""
          : name.split(/\s+/)[0];

      const greeting =
        firstName
          ? `Hej ${escapeHtml(firstName)}!`
          : "Hej!";

      const htmlContent = `
        <!doctype html>
        <html lang="sv">
          <body style="
            margin:0;
            padding:0;
            background:#f8fafc;
            font-family:Arial,sans-serif;
            color:#1e293b;
          ">
            <div style="
              max-width:560px;
              margin:0 auto;
              padding:32px 20px;
            ">
              <div style="
                background:#ffffff;
                border-radius:20px;
                padding:32px;
                border:1px solid #e2e8f0;
              ">
                <div style="
                  color:#183b70;
                  font-size:14px;
                  font-weight:700;
                  margin-bottom:8px;
                ">
                  ADAT JISRAEL
                </div>

                <h1 style="
                  margin:0 0 20px;
                  color:#183b70;
                  font-size:26px;
                  line-height:1.25;
                ">
                  Ditt konto är godkänt
                </h1>

                <p style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 16px;
                ">
                  ${greeting}
                </p>

                <p style="
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px;
                ">
                  Ditt konto i Adat Jisraels medlemsapp
                  har nu godkänts. Du kan logga in med
                  den mejladress och det lösenord du
                  valde när du registrerade dig.
                </p>

                <a
                  href="https://app.adatjisrael.se/"
                  style="
                    display:inline-block;
                    background:#183b70;
                    color:#ffffff;
                    text-decoration:none;
                    font-weight:700;
                    padding:13px 20px;
                    border-radius:12px;
                  "
                >
                  Öppna Adat Jisrael
                </a>

                <p style="
                  font-size:14px;
                  line-height:1.6;
                  color:#64748b;
                  margin:28px 0 0;
                ">
                  Välkommen till Adat Jisrael.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response =
        await fetch(
          "https://api.brevo.com/v3/smtp/email",
          {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key":
                BREVO_API_KEY.value(),
              "content-type":
                "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "Adat Jisrael",
                email:
                  "info@adatjisrael.se",
              },
              to: [
                {
                  email,
                  name:
                    after.name?.trim() ||
                    undefined,
                },
              ],
              subject:
                "Ditt konto hos Adat Jisrael är godkänt",
              htmlContent,
            }),
          },
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        logger.error(
          "Brevo kunde inte skicka godkännandemejl",
          {
            userId: event.params.userId,
            status: response.status,
            response: errorText,
          },
        );

        throw new Error(
          `Brevo svarade ${response.status}`,
        );
      }

      const result =
        await response.json() as {
          messageId?: string;
        };

      logger.info(
        "Godkännandemejl skickat",
        {
          userId: event.params.userId,
          messageId:
            result.messageId ?? null,
        },
      );
    },
  );

export const notifyCancelledTefila =
  onDocumentUpdated(
    "tfilot/{tefilaId}",
    async (event) => {
      const before =
        event.data?.before.data() as
          TefilaData | undefined;

      const after =
        event.data?.after.data() as
          TefilaData | undefined;

      if (!before || !after) {
        return;
      }

      /*
       * Bara övergången till cancelled ska skicka.
       * Ändringar på en redan inställd tfila ska
       * alltså inte skapa fler pushnotiser.
       */
      if (
        before.status === "cancelled" ||
        after.status !== "cancelled"
      ) {
        return;
      }

      const title =
        after.title?.trim() ||
        "Tfila";

      const date =
        after.date?.trim() || "";

      const time =
        normalizeTime(
          after.time?.trim() || "",
        );

      const timing =
        describeTiming(
          date,
          time,
        );

      const notificationTitle =
        timing === "i kväll"
          ? `${title} inställt i kväll`
          : timing === "i dag"
            ? `${title} inställt i dag`
            : timing === "i morgon"
              ? `${title} inställt i morgon`
              : `${title} inställt`;

      const bodyParts = [
        timing === "i kväll"
          ? `Kvällens ${title}`
          : timing === "i dag"
            ? `Dagens ${title}`
            : timing === "i morgon"
              ? `Morgondagens ${title}`
              : title,
        time
          ? `kl. ${time}`
          : "",
        "är inställt.",
      ].filter(Boolean);

      const result =
        await sendTfilaPush({
          title: notificationTitle,
          body: bodyParts.join(" "),
          data: {
            type: "tefila-cancelled",
            tefilaId:
              event.params.tefilaId,
            url: "/?page=home",
          },
        });

      logger.info(
        "Inställd tfila-push skickad",
        {
          tefilaId:
            event.params.tefilaId,
          ...result,
        },
      );
    },
  );

export const sendMinyanNeedPush =
  onCall(
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Du måste vara inloggad.",
        );
      }

      const callerSnapshot =
        await db
          .collection("users")
          .doc(request.auth.uid)
          .get();

      const caller =
        callerSnapshot.data() as
          UserData | undefined;

      if (caller?.role !== "admin") {
        throw new HttpsError(
          "permission-denied",
          "Endast admin får skicka minjanpåminnelser.",
        );
      }

      const tefilaId =
        typeof request.data?.tefilaId ===
        "string"
          ? request.data.tefilaId.trim()
          : "";

      if (!tefilaId) {
        throw new HttpsError(
          "invalid-argument",
          "tefilaId saknas.",
        );
      }

      const tefilaSnapshot =
        await db
          .collection("tfilot")
          .doc(tefilaId)
          .get();

      if (!tefilaSnapshot.exists) {
        throw new HttpsError(
          "not-found",
          "Tfilan finns inte.",
        );
      }

      const tefila =
        tefilaSnapshot.data() as
          TefilaData;

      if (
        tefila.status === "cancelled"
      ) {
        throw new HttpsError(
          "failed-precondition",
          "Tfilan är inställd.",
        );
      }

      const registrationsSnapshot =
        await db
          .collection("tfilot")
          .doc(tefilaId)
          .collection("registrations")
          .get();

      const registeredUserIds =
        new Set<string>();

      let attendance = 0;

      registrationsSnapshot.docs.forEach(
        (document) => {
          const registration =
            document.data() as
              TefilaRegistrationData;

          if (
            registration.attending ===
            false
          ) {
            return;
          }

          const userId =
            registration.userId ||
            document.id;

          registeredUserIds.add(
            userId,
          );

          attendance +=
            1 +
            Math.max(
              0,
              Math.floor(
                registration.guestCount ??
                  0,
              ),
            );
        },
      );

      const needed =
        Math.max(
          0,
          10 - attendance,
        );

      if (needed === 0) {
        throw new HttpsError(
          "failed-precondition",
          "Minjan är redan säkrad.",
        );
      }

      const recipients =
        await getTfilaRecipients({
          requireCountsForMinyan: true,
          excludeUserIds:
            registeredUserIds,
        });

      if (
        recipients.length === 0
      ) {
        throw new HttpsError(
          "not-found",
          "Det finns inga mottagare för denna påminnelse.",
        );
      }

      const title =
        formatNeededTitle(
          needed,
        );

      const tefilaTitle =
        tefila.title?.trim() ||
        "tfilan";

      const readableDate =
        formatSwedishDate(
          tefila.date || "",
        );

      const time =
        normalizeTime(
          tefila.time || "",
        );

      const body =
        `Vi är ${attendance} anmälda till ` +
        `${tefilaTitle}` +
        `${readableDate ? ` ${readableDate}` : ""}` +
        `${time ? ` kl. ${time}` : ""}. ` +
        "Kan du komma?";

      const result =
        await sendPushToRecipients(
          recipients,
          {
            title,
            body,
            data: {
              type: "minyan-needed",
              tefilaId,
              url: "/?page=home",
            },
          },
        );

      logger.info(
        "Minjanpåminnelse skickad",
        {
          tefilaId,
          attendance,
          needed,
          ...result,
        },
      );

      return {
        attendance,
        needed,
        ...result,
      };
    },
  );

export const sendNewsPush =
  onCall(
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Du måste vara inloggad.",
        );
      }

      const callerSnapshot =
        await db
          .collection("users")
          .doc(request.auth.uid)
          .get();

      const caller =
        callerSnapshot.data() as
          UserData | undefined;

      if (caller?.role !== "admin") {
        throw new HttpsError(
          "permission-denied",
          "Endast admin får skicka nyhetspush.",
        );
      }

      const title =
        typeof request.data?.title ===
        "string"
          ? request.data.title.trim()
          : "";

      const body =
        typeof request.data?.body ===
        "string"
          ? request.data.body.trim()
          : "";

      if (!title || !body) {
        throw new HttpsError(
          "invalid-argument",
          "Rubrik och ingress krävs.",
        );
      }

      const recipients =
        await getGeneralPushRecipients();

      const result =
        await sendPushToRecipients(
          recipients,
          {
            title,
            body,
            data: {
              type: "news",
              url: "/?page=information",
            },
          },
        );

      logger.info(
        "Nyhetspush skickad",
        result,
      );

      return result;
    },
  );

async function getGeneralPushRecipients():
  Promise<PushRecipient[]> {
  const usersSnapshot =
    await db
      .collection("users")
      .where(
        "status",
        "==",
        "approved",
      )
      .get();

  const allowedUserIds =
    new Set(
      usersSnapshot.docs.map(
        (document) =>
          document.id,
      ),
    );

  if (allowedUserIds.size === 0) {
    return [];
  }

  const registrationsSnapshot =
    await db
      .collection(
        "pushRegistrations",
      )
      .where(
        "enabled",
        "==",
        true,
      )
      .get();

  const recipients:
    PushRecipient[] = [];

  registrationsSnapshot.docs.forEach(
    (document) => {
      const registration =
        document.data() as
          PushRegistrationData;

      if (
        !registration.userId ||
        !registration.installationId
      ) {
        return;
      }

      if (
        !allowedUserIds.has(
          registration.userId,
        )
      ) {
        return;
      }

      recipients.push({
        documentId:
          document.id,
        fid:
          registration
            .installationId,
      });
    },
  );

  return recipients;
}

async function sendTfilaPush(
  message: {
    title: string;
    body: string;
    data: Record<string, string>;
  },
): Promise<SendResult> {
  const recipients =
    await getTfilaRecipients({
      requireCountsForMinyan: false,
      excludeUserIds:
        new Set<string>(),
    });

  return sendPushToRecipients(
    recipients,
    message,
  );
}

async function getTfilaRecipients(
  options: {
    requireCountsForMinyan: boolean;
    excludeUserIds: Set<string>;
  },
): Promise<PushRecipient[]> {
  const usersSnapshot =
    await db
      .collection("users")
      .where(
        "status",
        "==",
        "approved",
      )
      .get();

  const allowedUserIds =
    new Set<string>();

  usersSnapshot.docs.forEach(
    (document) => {
      const user =
        document.data() as UserData;

      /*
       * Saknas inställningen på ett äldre konto
       * behandlar vi den som PÅ, eftersom det är
       * defaulten i klienten.
       */
      const wantsTfilaPush =
        user
          .notificationPreferences
          ?.tfilot !== false;

      if (!wantsTfilaPush) {
        return;
      }

      if (
        options.requireCountsForMinyan &&
        user.countsForMinyan !== true
      ) {
        return;
      }

      if (
        options.excludeUserIds.has(
          document.id,
        )
      ) {
        return;
      }

      allowedUserIds.add(
        document.id,
      );
    },
  );

  if (
    allowedUserIds.size === 0
  ) {
    return [];
  }

  const registrationsSnapshot =
    await db
      .collection(
        "pushRegistrations",
      )
      .where(
        "enabled",
        "==",
        true,
      )
      .get();

  const recipients:
    PushRecipient[] = [];

  registrationsSnapshot.docs.forEach(
    (document) => {
      const registration =
        document.data() as
          PushRegistrationData;

      if (
        !registration.userId ||
        !registration.installationId
      ) {
        return;
      }

      if (
        !allowedUserIds.has(
          registration.userId,
        )
      ) {
        return;
      }

      recipients.push({
        documentId:
          document.id,
        fid:
          registration
            .installationId,
      });
    },
  );

  return recipients;
}

async function sendPushToRecipients(
  recipients: PushRecipient[],
  message: {
    title: string;
    body: string;
    data: Record<string, string>;
  },
): Promise<SendResult> {
  if (recipients.length === 0) {
    return {
      recipients: 0,
      successCount: 0,
      failureCount: 0,
    };
  }

  let successCount = 0;
  let failureCount = 0;

  /*
   * FCM multicast tillåter högst 500 FID:er
   * åt gången.
   */
  for (
    let offset = 0;
    offset < recipients.length;
    offset += 500
  ) {
    const batch =
      recipients.slice(
        offset,
        offset + 500,
      );

    const multicastMessage: FidMulticastMessage = {
      fids:
        batch.map(
          (recipient) =>
            recipient.fid,
        ),
      notification: {
        title:
          message.title,
        body:
          message.body,
      },
      data:
        message.data,
      webpush: {
        fcmOptions: {
          link:
            message.data.url,
        },
      },
    };

    const response =
      await getMessaging()
        .sendEachForMulticast(
          multicastMessage,
        );

    successCount +=
      response.successCount;

    failureCount +=
      response.failureCount;

    const invalidDocuments:
      string[] = [];

    response.responses.forEach(
      (item, index) => {
        if (item.success) {
          return;
        }

        const code =
          item.error?.code || "";

        logger.error(
          "FCM-utskick misslyckades",
          {
            code,
            message:
              item.error?.message ?? "",
            fid:
              batch[index]?.fid,
            error:
              item.error,
          },
        );

        if (
          code.includes(
            "installation-id-not-registered",
          ) ||
          code.includes(
            "registration-token-not-registered",
          ) ||
          code.includes(
            "invalid-registration-token",
          )
        ) {
          const documentId =
            batch[index]
              ?.documentId;

          if (documentId) {
            invalidDocuments.push(
              documentId,
            );
          }
        }
      },
    );

    if (
      invalidDocuments.length > 0
    ) {
      const firestoreBatch =
        db.batch();

      invalidDocuments.forEach(
        (documentId) => {
          firestoreBatch.delete(
            db
              .collection(
                "pushRegistrations",
              )
              .doc(documentId),
          );
        },
      );

      await firestoreBatch.commit();
    }
  }

  return {
    recipients:
      recipients.length,
    successCount,
    failureCount,
  };
}

function escapeHtml(
  value: string,
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeTime(
  value: string,
): string {
  return value.replace(".", ":");
}

function describeTiming(
  dateValue: string,
  timeValue: string,
): string {
  const target =
    parseLocalDate(
      dateValue,
      timeValue,
    );

  if (!target) {
    return "";
  }

  const now =
    stockholmNow();

  const targetDay =
    dateKey(target);

  const today =
    dateKey(now);

  const tomorrowDate =
    new Date(now);

  tomorrowDate.setDate(
    tomorrowDate.getDate() + 1,
  );

  const tomorrow =
    dateKey(tomorrowDate);

  if (targetDay === today) {
    if (
      target.getHours() >= 16
    ) {
      return "i kväll";
    }

    return "i dag";
  }

  if (
    targetDay === tomorrow
  ) {
    return "i morgon";
  }

  return "";
}

function stockholmNow(): Date {
  const parts =
    new Intl.DateTimeFormat(
      "sv-SE",
      {
        timeZone:
          "Europe/Stockholm",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      },
    ).formatToParts(
      new Date(),
    );

  const value =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ],
      ),
    );

  return new Date(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day),
    Number(value.hour),
    Number(value.minute),
    Number(value.second),
  );
}

function parseLocalDate(
  dateValue: string,
  timeValue: string,
): Date | null {
  const dateMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(dateValue);

  if (!dateMatch) {
    return null;
  }

  const timeMatch =
    /^(\d{1,2})[:.](\d{2})$/
      .exec(timeValue);

  const hour =
    timeMatch
      ? Number(timeMatch[1])
      : 12;

  const minute =
    timeMatch
      ? Number(timeMatch[2])
      : 0;

  return new Date(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    hour,
    minute,
  );
}

function dateKey(
  date: Date,
): string {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function formatNeededTitle(
  needed: number,
): string {
  if (needed === 1) {
    return "En till behövs till minjan";
  }

  if (needed === 2) {
    return "Två till behövs till minjan";
  }

  if (needed === 3) {
    return "Tre till behövs till minjan";
  }

  return `${needed} till behövs till minjan`;
}

function formatSwedishDate(
  value: string,
): string {
  const date =
    parseLocalDate(
      value,
      "12:00",
    );

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "sv-SE",
    {
      weekday: "long",
    },
  ).format(date);
}
