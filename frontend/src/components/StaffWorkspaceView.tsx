import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, FileSpreadsheet, Award, BarChart3, 
  CalendarCheck, BookOpen, Download, FileText, CheckCircle2, 
  Sparkles, Plus, QrCode, Search, AlertCircle, ArrowRight,
  Clock, Check, RefreshCw, Printer, ExternalLink, ShieldCheck
} from 'lucide-react';

interface StaffWorkspaceProps {
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StaffWorkspaceView: React.FC<StaffWorkspaceProps> = ({ onShowToast }) => {
  const [activeWorkflow, setActiveWorkflow] = useState<
    'academic_workspace' | 'excel_automation' | 'events_certificates' | 
    'result_analysis' | 'staff_work' | 'syllabus_hub'
  >('academic_workspace');

  // Workflow 1: AI Academic Workspace state
  const [subjectCode, setSubjectCode] = useState('CS3401');
  const [subjectName, setSubjectName] = useState('Design and Analysis of Algorithms');
  const [examTitle, setExamTitle] = useState('Internal Assessment Examination - I');
  const [syllabusTopic, setSyllabusTopic] = useState('Asymptotic Notations, Recurrence Relations, Divide & Conquer, Dynamic Programming, Greedy Algorithms');
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [isGeneratingQP, setIsGeneratingQP] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  // Workflow 2: Excel Automation state
  const [excelRows, setExcelRows] = useState([
    { reg_no: "731821104001", name: "Aakash M", cia1: 44, cia2: 42, assignment: 10 },
    { reg_no: "731821104002", name: "Bavithra S", cia1: 48, cia2: 46, assignment: 10 },
    { reg_no: "731821104003", name: "Chandran R", cia1: 18, cia2: 20, assignment: 6 },
    { reg_no: "731821104004", name: "Divya K", cia1: 38, cia2: 40, assignment: 9 },
    { reg_no: "731821104005", name: "Elango P", cia1: 46, cia2: 44, assignment: 10 },
    { reg_no: "731821104006", name: "Farooq A", cia1: 14, cia2: 16, assignment: 5 },
    { reg_no: "731821104007", name: "Gokulraj N", cia1: 42, cia2: 45, assignment: 10 }
  ]);
  const [processedExcelJob, setProcessedExcelJob] = useState<any>(null);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);

  // Workflow 3: Events & Certificates state
  const [eventTitle, setEventTitle] = useState('National Level Technical Symposium: CYBERFEST 2026');
  const [eventDate, setEventDate] = useState('28 October 2026');
  const [participantsList, setParticipantsList] = useState([
    { name: "Harish Kumar V", college: "Nandha Engineering College", department: "CSE", position: "First Prize" },
    { name: "Indhuja M", college: "Bannari Amman Institute", department: "IT", position: "Second Prize" },
    { name: "Janarthanan R", college: "Kongu Engineering College", department: "ECE", position: "Participant" },
    { name: "Kaviya Sri S", college: "Nandha Engineering College", department: "CSE", position: "Paper Presenter" }
  ]);
  const [generatedEventCerts, setGeneratedEventCerts] = useState<any>(null);
  const [isGeneratingCerts, setIsGeneratingCerts] = useState(false);
  const [verifiedCertResult, setVerifiedCertResult] = useState<any>(null);

  // Workflow 4: Result Analysis state
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzingResults, setIsAnalyzingResults] = useState(false);

  // Workflow 5: Staff Work Management state
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [staffTasks, setStaffTasks] = useState<any[]>([]);

  // Workflow 6: Syllabus & Resource Hub state
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // Load initial data for workflow 5 and 6
    fetch('/api/v1/academic/lesson-plans')
      .then(res => res.json())
      .then(data => setLessonPlans(data))
      .catch(console.error);

    fetch('/api/v1/academic/tasks')
      .then(res => res.json())
      .then(data => setStaffTasks(data))
      .catch(console.error);

    fetch('/api/v1/academic/resources')
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(console.error);
  }, []);

  // Handler 1: Generate Question Paper
  const handleGenerateQuestionPaper = async () => {
    setIsGeneratingQP(true);
    try {
      const res = await fetch('/api/v1/academic/question-paper/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_code: subjectCode,
          subject_name: subjectName,
          topic_or_syllabus: syllabusTopic,
          exam_title: examTitle
        })
      });
      const data = await res.json();
      setGeneratedPaper(data);
      onShowToast('success', 'Question Paper Generated', 'Complete with Part A, Part B, Part C & Answer Key.');
    } catch (err: any) {
      onShowToast('error', 'Generation Failed', err.message);
    } finally {
      setIsGeneratingQP(false);
    }
  };

  // Handler 2: Process Excel Marks
  const handleProcessExcel = async () => {
    setIsProcessingExcel(true);
    try {
      const res = await fetch('/api/v1/academic/excel/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: excelRows,
          file_name: `${subjectCode}_marks_verified.xlsx`
        })
      });
      const data = await res.json();
      setProcessedExcelJob(data);
      onShowToast('success', 'Excel Data Calculated', `Pass Percentage: ${data.summary_stats.pass_percentage}%`);
    } catch (err: any) {
      onShowToast('error', 'Processing Failed', err.message);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  // Handler 3: Generate Bulk Certificates
  const handleGenerateCerts = async () => {
    setIsGeneratingCerts(true);
    try {
      const res = await fetch('/api/v1/academic/events/create-and-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          event_date: eventDate,
          department: "CSE",
          participants: participantsList
        })
      });
      const data = await res.json();
      setGeneratedEventCerts(data);
      onShowToast('success', 'Certificates Generated', `Created ${data.total_certificates} certificates with QR verification.`);
    } catch (err: any) {
      onShowToast('error', 'Certificate Generation Failed', err.message);
    } finally {
      setIsGeneratingCerts(false);
    }
  };

  const handleVerifyQR = async (certCode: string) => {
    try {
      const res = await fetch(`/api/v1/academic/certificates/verify/${certCode}`);
      const data = await res.json();
      setVerifiedCertResult(data);
      if (data.verified) {
        onShowToast('success', 'Official Verification', `Verified certificate for ${data.student_name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler 4: Result Analysis
  const handleAnalyzeResults = async () => {
    setIsAnalyzingResults(true);
    try {
      const res = await fetch('/api/v1/academic/results/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_code: subjectCode,
          subject_name: subjectName,
          exam_name: "Internal Assessment Examination - I",
          student_records: excelRows.map(r => ({
            ...r,
            total: (r.cia1 * 0.8) + (r.cia2 * 0.8) + r.assignment + 10
          }))
        })
      });
      const data = await res.json();
      setAnalysisResult(data);
      onShowToast('success', 'Result Analysis Complete', `Identified ${data.arrears_students.length} arrears and weak topics.`);
    } catch (err: any) {
      onShowToast('error', 'Analysis Failed', err.message);
    } finally {
      setIsAnalyzingResults(false);
    }
  };

  const workflows = [
    { id: 'academic_workspace', title: '1. AI Academic Workspace', desc: 'Syllabus to Question Papers & Answer Keys', icon: GraduationCap },
    { id: 'excel_automation', title: '2. Excel & Marks Automation', desc: 'Upload, validate, calculate & format grade sheets', icon: FileSpreadsheet },
    { id: 'events_certificates', title: '3. Event & QR Certificates', desc: 'Participant list to bulk PDF & QR verification', icon: Award },
    { id: 'result_analysis', title: '4. Result Analysis & Charts', desc: 'Pass %, arrears, averages & weak topics', icon: BarChart3 },
    { id: 'staff_work', title: '5. Staff Work Management', desc: 'Lesson plans, deadlines, tasks & approvals', icon: CalendarCheck },
    { id: 'syllabus_hub', title: '6. Syllabus & Resource Hub', desc: 'Department notes, question banks & templates', icon: BookOpen },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nandha Engineering College (Autonomous) • Faculty Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Staff Academic Automation Platform
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end autonomous academic workflows: Question papers, Excel marks automation, QR certificates, and analytics.
          </p>
        </div>
      </div>

      {/* 6 Workflows Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {workflows.map((wf) => {
          const Icon = wf.icon;
          const isActive = activeWorkflow === wf.id;
          return (
            <button
              key={wf.id}
              onClick={() => setActiveWorkflow(wf.id as any)}
              className={`p-3.5 rounded-2xl text-left border flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
              }`}
            >
              <div className="mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400 dark:text-brand-600' : 'text-slate-500'}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-snug line-clamp-2">{wf.title}</h4>
                <p className={`text-[10px] mt-1 line-clamp-1 opacity-70`}>{wf.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* WORKFLOW 1: AI ACADEMIC WORKSPACE */}
      {/* ========================================================================= */}
      {activeWorkflow === 'academic_workspace' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                  <span>AI Question Paper & Answer Key Generator</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Input subject code, name and syllabus units. AI synthesizes Bloom's level questions and exports Word & PDF.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-medium">Quick Presets:</span>
                <button
                  onClick={() => {
                    setSubjectCode('CS3401');
                    setSubjectName('Design and Analysis of Algorithms');
                    setSyllabusTopic('Asymptotic Notations, Recurrence Relations, Divide & Conquer, Dynamic Programming, Greedy Algorithms');
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                >
                  Algorithms
                </button>
                <button
                  onClick={() => {
                    setSubjectCode('CS3491');
                    setSubjectName('Operating Systems');
                    setSyllabusTopic('Processes, Threads, CPU Scheduling, Deadlocks, Memory Management, Paging, Virtual Memory');
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                >
                  Operating Systems
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Examination Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold mb-1">Syllabus Topic or Units Description</label>
                <textarea
                  rows={3}
                  value={syllabusTopic}
                  onChange={(e) => setSyllabusTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Paste syllabus units or enter topics..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateQuestionPaper}
                disabled={isGeneratingQP}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingQP ? 'Generating Question Paper...' : 'Generate Full Question Paper & Key'}</span>
              </button>
            </div>
          </div>

          {/* Generated Paper Preview & Export Bar */}
          {generatedPaper && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Document Header & Download Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-0.5">
                    Nandha Engineering College (Autonomous)
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {generatedPaper.subject_code} — {generatedPaper.subject_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {generatedPaper.exam_title} • Time: 3 Hours • Max Marks: 100
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    {showAnswerKey ? 'Show Question Paper' : 'Show Answer Key'}
                  </button>

                  <a
                    href={`/api/v1/academic/question-paper/${generatedPaper.id}/export/docx`}
                    download
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Word (.docx)</span>
                  </a>

                  <a
                    href={`/api/v1/academic/question-paper/${generatedPaper.id}/export/pdf`}
                    download
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {!showAnswerKey ? (
                // Live Question Paper Layout
                <div className="space-y-6 text-xs text-slate-800 dark:text-slate-200">
                  {/* Part A */}
                  <div>
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        PART A — (5 × 2 = 10 Marks)
                      </h5>
                      <span className="text-[11px] text-slate-400">Answer ALL Questions</span>
                    </div>
                    <div className="space-y-2">
                      {generatedPaper.content.part_a?.map((q: any) => (
                        <div key={q.q_no} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex justify-between items-start gap-4">
                          <div>
                            <span className="font-bold mr-2 text-brand-600">Q.{q.q_no}</span>
                            <span>{q.question}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-bold flex-shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{q.course_outcome}</span>
                            <span className="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">{q.bloom_level}</span>
                            <span>[2 Marks]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part B */}
                  <div>
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        PART B — (3 × 10 = 30 Marks)
                      </h5>
                      <span className="text-[11px] text-slate-400">Answer ALL Questions (Either / Or Choice)</span>
                    </div>
                    <div className="space-y-3">
                      {generatedPaper.content.part_b?.map((b: any) => (
                        <div key={b.q_no} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold mr-2 text-brand-600">Q.{b.q_no}</span>
                              <span>{b.question}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600">
                              [10 Marks | {b.bloom_level} | {b.course_outcome}]
                            </span>
                          </div>
                          <div className="text-center font-bold text-slate-400 text-[11px]">[ OR ]</div>
                          <div className="pl-6">
                            <span>(b) {b.or_question}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part C */}
                  <div>
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        PART C — Comprehensive Case Study (1 × 15 = 15 Marks)
                      </h5>
                    </div>
                    {generatedPaper.content.part_c?.map((c: any) => (
                      <div key={c.q_no} className="p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900">
                        <span className="font-bold mr-2 text-brand-600">Q.{c.q_no}</span>
                        <span>{c.question}</span>
                        <div className="mt-2 text-[11px] text-slate-500 font-semibold">
                          Rubric: {c.rubric}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                // Answer Key & Solutions
                <div className="space-y-4 text-xs">
                  <h5 className="font-bold uppercase text-slate-900 dark:text-white">Official Answer Key & Evaluation Rubrics</h5>
                  {generatedPaper.answer_key.part_a_solutions?.map((sol: any) => (
                    <div key={sol.q_no} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="font-bold text-brand-600 mr-2">Q.{sol.q_no} Solution:</span>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{sol.points}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW 2: DOCUMENT & EXCEL AUTOMATION */}
      {/* ========================================================================= */}
      {activeWorkflow === 'excel_automation' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Document & Student Marks Excel Automation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Automated spreadsheet calculations, range validation, formula application, and formatted Excel/PDF report export.
                </p>
              </div>

              <button
                onClick={handleProcessExcel}
                disabled={isProcessingExcel}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessingExcel ? 'Validating & Formatting...' : 'Calculate & Generate Grade Sheet'}</span>
              </button>
            </div>

            {/* Editable Raw Marks Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Register No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">CIA-1 (Max 50)</th>
                    <th className="py-2.5 px-3">CIA-2 (Max 50)</th>
                    <th className="py-2.5 px-3">Assignment (Max 10)</th>
                    <th className="py-2.5 px-3">Scaled Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {excelRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{row.reg_no}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{row.name}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={row.cia1}
                          onChange={(e) => {
                            const newRows = [...excelRows];
                            newRows[idx].cia1 = Number(e.target.value);
                            setExcelRows(newRows);
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={row.cia2}
                          onChange={(e) => {
                            const newRows = [...excelRows];
                            newRows[idx].cia2 = Number(e.target.value);
                            setExcelRows(newRows);
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={row.assignment}
                          onChange={(e) => {
                            const newRows = [...excelRows];
                            newRows[idx].assignment = Number(e.target.value);
                            setExcelRows(newRows);
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-center font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold text-brand-600">
                        {round((row.cia1 * 0.8) + (row.cia2 * 0.8) + row.assignment + 10, 1)} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Processed Results & Real Download */}
          {processedExcelJob && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Formatted Spreadsheet Generated Successfully</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Validated {processedExcelJob.valid_records} student records • 0 Invalid records
                  </p>
                </div>

                <a
                  href={processedExcelJob.download_url}
                  download
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Formatted Excel (.xlsx)</span>
                </a>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Pass Percentage</span>
                  <span className="text-xl font-extrabold text-emerald-600">{processedExcelJob.summary_stats.pass_percentage}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Class Average</span>
                  <span className="text-xl font-extrabold text-brand-600">{processedExcelJob.summary_stats.class_average} / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Highest Mark</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{processedExcelJob.summary_stats.highest_mark}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Passed / Failed</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {processedExcelJob.summary_stats.passed_count} / {processedExcelJob.summary_stats.failed_count}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW 3: EVENT & CERTIFICATE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeWorkflow === 'events_certificates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Event & Bulk Certificate Management with QR Verification</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Import participant attendance, generate landscape certificates with golden seal and cryptographic QR validation code.
                </p>
              </div>

              <button
                onClick={handleGenerateCerts}
                disabled={isGeneratingCerts}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-40"
              >
                <QrCode className="w-4 h-4" />
                <span>{isGeneratingCerts ? 'Generating Certificates...' : 'Generate Bulk Certificates & QR'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Event Date</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Participants Table */}
            <div>
              <span className="font-semibold text-xs block mb-2">Participant Roster ({participantsList.length})</span>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Participant Name</th>
                      <th className="py-2.5 px-3">College</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Achievement / Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {participantsList.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{p.college}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{p.department}</td>
                        <td className="py-2.5 px-3 font-semibold text-brand-600 dark:text-brand-400">{p.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Generated Certificates & QR Verification Cards */}
          {generatedEventCerts && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Issued Certificates with Instant Verification</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedEventCerts.certificates.map((cert: any) => (
                  <div key={cert.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">{cert.cert_code}</span>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{cert.student_name}</h5>
                      <span className="text-xs text-brand-600 font-semibold">{cert.position}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerifyQR(cert.cert_code)}
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                        title="Simulate Scanning QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <a
                        href={cert.download_url}
                        download
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* QR Scan Verification Modal / Result Box */}
              {verifiedCertResult && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm">Authenticated Institutional Record</span>
                  </div>
                  <p><b>Certificate Code:</b> {verifiedCertResult.cert_code}</p>
                  <p><b>Recipient:</b> {verifiedCertResult.student_name} ({verifiedCertResult.college_name})</p>
                  <p><b>Event:</b> {verifiedCertResult.event_title} on {verifiedCertResult.event_date}</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">{verifiedCertResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW 4: RESULT ANALYSIS & CHARTS */}
      {/* ========================================================================= */}
      {activeWorkflow === 'result_analysis' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Student Result Analysis, Arrear Detection & Remediation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Computes pass percentages, identifies fail/arrear students, and pinpoints low-accuracy topics for faculty review.
                </p>
              </div>

              <button
                onClick={handleAnalyzeResults}
                disabled={isAnalyzingResults}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzingResults ? 'Analyzing Mark Sheets...' : 'Run Result Analysis'}</span>
              </button>
            </div>
          </div>

          {analysisResult && (
            <div className="space-y-6">
              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Pass Percentage</span>
                  <span className="text-2xl font-extrabold text-emerald-600">{analysisResult.pass_percentage}%</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Class Average</span>
                  <span className="text-2xl font-extrabold text-brand-600">{analysisResult.class_average} / 100</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Total Candidates</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{analysisResult.total_students}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Total Arrears (Fail)</span>
                  <span className="text-2xl font-extrabold text-rose-600">{analysisResult.failed_count}</span>
                </div>
              </div>

              {/* Grade Distribution & Arrears */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Grade Bars */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Grade Distribution Breakdown
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    {Object.entries(analysisResult.grade_distribution).map(([grade, count]: any) => (
                      <div key={grade}>
                        <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                          <span>Grade {grade}</span>
                          <span>{count} Students</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${grade === 'U' ? 'bg-rose-500' : 'bg-brand-500'}`}
                            style={{ width: `${(count / analysisResult.total_students) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrears List & Remediation Focus */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Arrears Students & Remedial Attention</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.arrears_students.map((arr: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">{arr.reg_no}</span>
                          <span className="text-slate-500">{arr.name}</span>
                        </div>
                        <span className="font-bold text-rose-600">{arr.marks} / 100</span>
                      </div>
                    ))}
                  </div>

                  {/* Weak Topics */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">Identified Weak Topic Areas</span>
                    <div className="space-y-1.5">
                      {analysisResult.weak_topics.map((t: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between text-xs">
                          <span>{t.topic}</span>
                          <span className="text-rose-600 font-bold">{t.avg_accuracy} Avg Score</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW 5: STAFF WORK MANAGEMENT */}
      {/* ========================================================================= */}
      {activeWorkflow === 'staff_work' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Lesson Plans (Column 7) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <CalendarCheck className="w-5 h-5 text-brand-600" />
                  <span>Lesson Plan & Syllabus Delivery Tracker</span>
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  CS3401 Algorithms
                </span>
              </div>

              <div className="space-y-2.5">
                {lessonPlans.map((lp) => (
                  <div key={lp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-brand-600">Unit {lp.unit_number}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{lp.topic_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Planned: {lp.planned_hours}h | Actual: {lp.actual_hours}h | Aid: {lp.teaching_aid}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      lp.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : lp.status === 'In Progress'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {lp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Tasks & Approvals (Column 5) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming Academic Deadlines & Tasks
              </h3>
              <div className="space-y-3">
                {staffTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 dark:text-white">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {task.deadline}</span>
                      </span>
                      <span className="font-semibold text-brand-600">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW 6: SYLLABUS & RESOURCE HUB */}
      {/* ========================================================================= */}
      {activeWorkflow === 'syllabus_hub' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>Department Syllabus, Question Banks & Resource Hub</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Digital archive for Regulation 2023 syllabi, 2-mark & 10-mark question banks, and reusable course templates.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-400">Department:</span>
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                  Computer Science & Engineering
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                        {r.resource_type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{r.file_format} • {r.file_size}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {r.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {r.subject_code} — {r.subject_name} ({r.unit_number})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-400">Sem {r.semester}</span>
                    <button
                      onClick={() => onShowToast('success', 'Download Started', `Downloading ${r.title}`)}
                      className="inline-flex items-center space-x-1 font-bold text-brand-600 hover:text-brand-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function round(val: number, decimals: number) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}
