import SwiftUI

struct ContentView: View {
    @State private var selectedModule: String? = nil
    @State private var showingTaskDetail = false
    @State private var selectedTask: Task? = nil
    
    let modules = [
        Module(
            id: "word",
            title: "Microsoft Word",
            icon: "doc.text",
            description: "Textverarbeitung mit DIN 5008, Briefgestaltung, Serienbriefen",
            tasksCount: 45,
            hours: 12,
            difficulty: "Mittel",
            progress: 0.35,
            color: .blue
        ),
        Module(
            id: "excel",
            title: "Microsoft Excel",
            icon: "chart.bar.doc.horizontal",
            description: "Tabellenkalkulation mit Formeln, SVERWEIS, Pivot-Tabellen",
            tasksCount: 52,
            hours: 15,
            difficulty: "Schwer",
            progress: 0.20,
            color: .green
        ),
        Module(
            id: "powerpoint",
            title: "PowerPoint",
            icon: "play.rectangle",
            description: "Präsentationen mit Design, Animationen, Vortragstechnik",
            tasksCount: 28,
            hours: 8,
            difficulty: "Einfach",
            progress: 0.60,
            color: .orange
        ),
        Module(
            id: "outlook",
            title: "Outlook",
            icon: "envelope",
            description: "E-Mail-Management, Kalenderplanung, Aufgabenverwaltung",
            tasksCount: 25,
            hours: 6,
            difficulty: "Einfach",
            progress: 0.80,
            color: .purple
        )
    ]
    
    let recentTasks = [
        Task(
            id: "word-001",
            moduleId: "word",
            title: "DIN 5008 Geschäftsbrief",
            description: "Erstellen Sie einen normgerechten Geschäftsbrief nach DIN 5008 mit Absender, Empfänger, Datum, Betreff, Grußformel und Unterschrift.",
            duration: "15 Min",
            points: 10,
            difficulty: "Mittel",
            isCompleted: false
        ),
        Task(
            id: "excel-001",
            moduleId: "excel",
            title: "SVERWEIS Kundendaten",
            description: "Verbinden Sie zwei Tabellen mit SVERWEIS und erstellen Sie eine Kundendatenbank mit automatischer Datenabfrage.",
            duration: "20 Min",
            points: 15,
            difficulty: "Mittel",
            isCompleted: false
        ),
        Task(
            id: "ppt-001",
            moduleId: "powerpoint",
            title: "Unternehmenspräsentation",
            description: "Erstellen Sie eine 15-seitige Unternehmenspräsentation mit Masterfolien und Animationen.",
            duration: "25 Min",
            points: 16,
            difficulty: "Mittel",
            isCompleted: false
        )
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Hero Section
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
            .navigationTitle("IHK Lernplattform")
            .navigationBarTitleDisplayMode(.large)
            .background(Color(.systemGroupedBackground))
        }
        .sheet(isPresented: $showingTaskDetail) {
            if let task = selectedTask {
                TaskDetailView(task: task)
            }
        }
    }
}

// Hero Section
struct HeroSection: View {
    var body: some View {
        VStack(spacing: 15) {
            Text("IHK Lernplattform")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("Professionelle Prüfungsvorbereitung für Informationstechnisches Büromanagement")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            HStack(spacing: 30) {
                StatItem(number: "150", label: "Aufgaben")
                StatItem(number: "38", label: "Stunden")
                StatItem(number: "92%", label: "Erfolgsquote")
            }
        }
        .padding()
        .background(
            LinearGradient(
                gradient: Gradient(colors: [.blue, .purple]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .foregroundColor(.white)
        .cornerRadius(15)
        .shadow(radius: 10)
    }
}

// Stat Item
struct StatItem: View {
    let number: String
    let label: String
    
    var body: some View {
        VStack(spacing: 5) {
            Text(number)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption)
                .opacity(0.8)
        }
    }
}

// Modules Section
struct ModulesSection: View {
    let modules: [Module]
    @Binding var selectedModule: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Lernmodule")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 15) {
                ForEach(modules) { module in
                    ModuleCard(module: module)
                        .onTapGesture {
                            selectedModule = module.id
                        }
                }
            }
        }
    }
}

// Module Card
struct ModuleCard: View {
    let module: Module
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: module.icon)
                    .font(.title2)
                    .foregroundColor(.white)
                    .frame(width: 50, height: 50)
                    .background(module.color)
                    .cornerRadius(10)
                
                VStack(alignment: .leading, spacing: 5) {
                    Text(module.title)
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text(module.difficulty)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            Text(module.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)
            
            HStack {
                Text("\(module.tasksCount) Aufgaben")
                    .font(.caption)
                Spacer()
                Text("\(module.hours) Std.")
                    .font(.caption)
            }
            .foregroundColor(.secondary)
            
            // Progress Bar
            ProgressView(value: module.progress)
                .progressViewStyle(LinearProgressViewStyle(tint: module.color))
                .scaleEffect(y: 0.8)
            
            Button(action: {
                // Module starten
            }) {
                HStack {
                    Text("Modul starten")
                    Spacer()
                    Image(systemName: "arrow.right")
                }
                .foregroundColor(.white)
                .padding()
                .background(
                    LinearGradient(
                        gradient: Gradient(colors: [module.color.opacity(0.8), module.color]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(8)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

// Recent Tasks Section
struct RecentTasksSection: View {
    let tasks: [Task]
    @Binding var selectedTask: Task?
    @Binding var showingTaskDetail: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Aktuelle Aufgaben")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)
            
            VStack(spacing: 10) {
                ForEach(tasks) { task in
                    TaskRow(task: task)
                        .onTapGesture {
                            selectedTask = task
                            showingTaskDetail = true
                        }
                }
            }
        }
    }
}

// Task Row
struct TaskRow: View {
    let task: Task
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 5) {
                Text(task.title)
                    .font(.headline)
                    .fontWeight(.medium)
                
                Text(task.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                HStack {
                    Text(task.moduleId.uppercased())
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(4)
                    
                    Text("⏱️ \(task.duration)")
                        .font(.caption)
                    
                    Text("🎯 \(task.points) Pkt")
                        .font(.caption)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

// Progress Section
struct ProgressSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Dein Fortschritt")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 15) {
                ProgressCard(number: "47", label: "Aufgaben erledigt")
                ProgressCard(number: "31%", label: "Gesamtfortschritt")
                ProgressCard(number: "12", label: "Lern-Streak (Tage)")
                ProgressCard(number: "245", label: "Punkte gesamt")
                ProgressCard(number: "4.8", label: "⭐ Durchschnitt")
                ProgressCard(number: "89%", label: "Erfolgsquote")
            }
        }
    }
}

// Progress Card
struct ProgressCard: View {
    let number: String
    let label: String
    
    var body: some View {
        VStack(spacing: 10) {
            Text(number)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

// Task Detail View
struct TaskDetailView: View {
    let task: Task
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Task Header
                    VStack(alignment: .leading, spacing: 10) {
                        Text(task.title)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text(task.description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Task Meta
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        HStack {
                            Label("Modul", systemImage: "folder")
                            Spacer()
                            Text(task.moduleId)
                        }
                        
                        HStack {
                            Label("Dauer", systemImage: "clock")
                            Spacer()
                            Text(task.duration)
                        }
                        
                        HStack {
                            Label("Punkte", systemImage: "star")
                            Spacer()
                            Text("\(task.points) Pkt")
                        }
                        
                        HStack {
                            Label("Schwierigkeit", systemImage: "chart.bar")
                            Spacer()
                            Text(task.difficulty)
                        }
                    }
                    .padding()
                    .background(Color(.secondarySystemGroupedBackground))
                    .cornerRadius(12)
                    
                    // Start Button
                    Button(action: {
                        startTask()
                    }) {
                        HStack {
                            Image(systemName: "play.fill")
                            Text("Aufgabe starten")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(12)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding()
            }
            .navigationTitle("Aufgabe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Schließen") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
    
    private func startTask() {
        // Hier kommt die Lernumgebung hin
        let alert = UIAlertController(
            title: "Aufgabe starten",
            message: "Die Aufgabe '\(task.title)' wird vorbereitet...",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            presentationMode.wrappedValue.dismiss()
        })
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            rootViewController.present(alert, animated: true)
        }
    }
}

// Data Models
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
}

// Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}