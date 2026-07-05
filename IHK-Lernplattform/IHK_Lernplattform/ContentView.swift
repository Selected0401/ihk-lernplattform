import SwiftUI
import FirebaseAuth
import StoreKit

// MARK: - Main App with License System
@main
struct IHK_LernplattformApp: App {
    @StateObject private var licenseManager = LicenseManager()
    @StateObject private var storeManager = StoreManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(licenseManager)
                .environmentObject(storeManager)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // Firebase Konfiguration
        // Analytics und Crashlytics
        // Push-Benachrichtigungen
    }
}

// MARK: - License Management
class LicenseManager: ObservableObject {
    @Published var isLicensed = false
    @Published var licenseKey = ""
    @Published var user: User?
    @Published var isLoading = false
    @Published var errorMessage = ""
    
    func validateLicense(key: String) async {
        isLoading = true
        errorMessage = ""
        
        do {
            // API Call zur Lizenz-Validierung
            let isValid = try await LicenseAPI.validate(key: key)
            
            await MainActor.run {
                if isValid {
                    isLicensed = true
                    licenseKey = key
                    saveLicenseToKeychain(key: key)
                } else {
                    errorMessage = "Ungültiger Lizenz-Schlüssel"
                }
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Fehler bei der Lizenz-Validierung: \(error.localizedDescription)"
                isLoading = false
            }
        }
    }
    
    func checkSavedLicense() {
        if let savedKey = getLicenseFromKeychain() {
            Task {
                await validateLicense(key: savedKey)
            }
        }
    }
    
    private func saveLicenseToKeychain(key: String) {
        // Keychain Integration
    }
    
    private func getLicenseFromKeychain() -> String? {
        // Keychain Integration
        return nil
    }
}

// MARK: - Store Management (In-App Purchases)
class StoreManager: NSObject, ObservableObject, SKPaymentTransactionObserver {
    @Published var products: [SKProduct] = []
    @Published var isLoading = false
    
    func fetchProducts() {
        isLoading = true
        
        let productIdentifiers = Set([
            "com.alex.ihk.lernplattform.monthly",
            "com.alex.ihk.lernplattform.yearly",
            "com.alex.ihk.lernplattform.lifetime"
        ])
        
        let request = SKProductsRequest(productIdentifiers: productIdentifiers)
        request.delegate = self
        request.start()
    }
    
    func purchaseProduct(_ product: SKProduct) {
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                completeTransaction(transaction)
            case .failed:
                failedTransaction(transaction)
            case .restored:
                restoreTransaction(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    private func completeTransaction(_ transaction: SKPaymentTransaction) {
        // Lizenz aktivieren
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func failedTransaction(_ transaction: SKPaymentTransaction) {
        if let error = transaction.error as? SKError, error.code != .paymentCancelled {
            // Fehler anzeigen
        }
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func restoreTransaction(_ transaction: SKPaymentTransaction) {
        // Wiederherstellung
        SKPaymentQueue.default().finishTransaction(transaction)
    }
}

// MARK: - Enhanced ContentView with License System
struct ContentView: View {
    @EnvironmentObject var licenseManager: LicenseManager
    @EnvironmentObject var storeManager: StoreManager
    
    @State private var selectedModule: String? = nil
    @State private var showingTaskDetail = false
    @State private var selectedTask: Task? = nil
    @State private var showingLicenseModal = false
    @State private var showingStoreModal = false
    @State private var licenseInput = ""
    
    var body: some View {
        NavigationView {
            Group {
                if licenseManager.isLicensed {
                    MainAppContent()
                } else {
                    LicenseGateView()
                }
            }
            .navigationTitle("IHK Lernplattform")
            .navigationBarTitleDisplayMode(.large)
            .background(Color(.systemGroupedBackground))
        }
        .sheet(isPresented: $showingLicenseModal) {
            LicenseInputView(licenseInput: $licenseInput)
        }
        .sheet(isPresented: $showingStoreModal) {
            StoreView()
        }
        .onAppear {
            licenseManager.checkSavedLicense()
            storeManager.fetchProducts()
        }
    }
    
    // MARK: - Main App Content (Licensed)
    @ViewBuilder
    private func MainAppContent() -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // Hero Section mit User-Info
                HeroSection()
                    .padding(.bottom, 20)
                
                // Module Section
                ModulesSection(modules: modules, selectedModule: $selectedModule)
                    .padding(.bottom, 20)
                
                // Recent Tasks Section
                RecentTasksSection(tasks: recentTasks, selectedTask: $selectedTask, showingTaskDetail: $showingTaskDetail)
                    .padding(.bottom, 20)
                
                // Progress Section
                ProgressSection()
                    .padding(.bottom, 20)
            }
            .padding()
        }
        .sheet(isPresented: $showingTaskDetail) {
            if let task = selectedTask {
                TaskDetailView(task: task)
            }
        }
    }
    
    // MARK: - License Gate (Unlicensed)
    @ViewBuilder
    private func LicenseGateView() -> some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Logo und Titel
            VStack(spacing: 15) {
                Image(systemName: "graduationcap.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("IHK Lernplattform")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Professionelle Prüfungsvorbereitung")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Features
            VStack(spacing: 20) {
                FeatureRow(icon: "doc.text.fill", title: "150+ Aufgaben", description: "Echte IHK-Prüfungsaufgaben")
                FeatureRow(icon: "chart.bar.fill", title: "Fortschritt tracking", description: "Dein persönlicher Lernfortschritt")
                FeatureRow(icon: "iphone.fill", title: "iOS Native", description: "Optimiert für iPhone & iPad")
                FeatureRow(icon: "star.fill", title: "92% Erfolgsquote", description: "Beste Vorbereitung garantiert")
            }
            .padding()
            
            // Lizenz-Buttons
            VStack(spacing: 15) {
                Button(action: {
                    showingLicenseModal = true
                }) {
                    HStack {
                        Image(systemName: "key.fill")
                        Text("Lizenz-Schlüssel eingeben")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                
                Button(action: {
                    showingStoreModal = true
                }) {
                    HStack {
                        Image(systemName: "cart.fill")
                        Text("Lizenz kaufen")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
    }
    
    // MARK: - License Input Modal
    private func LicenseInputView(licenseInput: Binding<String>) -> some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Lizenz aktivieren")
                    .font(.title2)
                    .fontWeight(.bold)
                
                TextField("Lizenz-Schlüssel eingeben", text: licenseInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.default)
                    .autocapitalization(.allCharacters)
                
                Text("Gib deinen Lizenz-Schlüssel ein, den du nach dem Kauf per E-Mail erhalten hast.")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                Spacer()
                
                Button(action: {
                    Task {
                        await licenseManager.validateLicense(key: licenseInput.wrappedValue)
                    }
                }) {
                    HStack {
                        if licenseManager.isLoading {
                            ProgressView()
                                .scaleEffect(0.8)
                        }
                        Text("Lizenz aktivieren")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(licenseManager.isLoading ? Color.gray : Color.blue)
                    .cornerRadius(12)
                }
                .disabled(licenseManager.isLoading)
                
                if !licenseManager.errorMessage.isEmpty {
                    Text(licenseManager.errorMessage)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
            .padding()
            .navigationTitle("Lizenz")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Abbrechen") {
                        showingLicenseModal = false
                    }
                }
            }
        }
    }
    
    // MARK: - Store View
    private func StoreView() -> some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Wähle deinen Tarif")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    // Store Products
                    ForEach(storeManager.products, id: \.productIdentifier) { product in
                        StoreProductCard(product: product) {
                            storeManager.purchaseProduct(product)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Shop")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Schließen") {
                        showingStoreModal = false
                    }
                }
            }
        }
    }
}

// MARK: - Feature Row
struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.medium)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Store Product Card
struct StoreProductCard: View {
    let product: SKProduct
    let onPurchase: () -> Void
    
    var body: some View {
        VStack(spacing: 15) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(product.localizedTitle)
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Text(product.localizedDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text(product.localizedPrice)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                    
                    Text(product.priceLocale.currencySymbol ?? "€")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Button(action: onPurchase) {
                HStack {
                    Image(systemName: "cart.fill")
                    Text("Kaufen")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.green)
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

// MARK: - Data Models (erweitert)
struct Module: Identifiable {
    let id: String
    let title: String
    let icon: String
    let description: String
    let tasksCount: Int
    let hours: Int
    let difficulty: String
    let progress: Double
    let color: Color
    let isLocked: Bool // Neue Eigenschaft
}

struct Task: Identifiable {
    let id: String
    let moduleId: String
    let title: String
    let description: String
    let duration: String
    let points: Int
    let difficulty: String
    let isCompleted: Bool
    let isLocked: Bool // Neue Eigenschaft
}

// MARK: - License API
struct LicenseAPI {
    static func validate(key: String) async throws -> Bool {
        // API-Call zu deinem Backend
        guard let url = URL(string: "https://api.ihk-lernplattform.de/validate") else {
            throw URLError(.badURL)
        }
        
        let request = URLRequest(url: url)
        let (data, _) = try await URLSession.shared.data(for: request)
        
        // JSON-Parsing und Validierung
        return true // Platzhalter
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(LicenseManager())
            .environmentObject(StoreManager())
    }
}