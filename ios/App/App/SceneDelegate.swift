import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.backgroundColor = .white

        let bridgeViewController = CAPBridgeViewController()
        bridgeViewController.view.backgroundColor = .white

        window?.rootViewController = bridgeViewController
        window?.makeKeyAndVisible()

        if let statusBarFrame = windowScene.statusBarManager?.statusBarFrame {
            let statusBarBackground = UIView(frame: statusBarFrame)
            statusBarBackground.backgroundColor = .white
            statusBarBackground.autoresizingMask = [.flexibleWidth]
            statusBarBackground.isUserInteractionEnabled = false
            window?.addSubview(statusBarBackground)
        }

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
