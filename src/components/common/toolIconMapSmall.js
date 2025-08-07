import { BookOpen, PenSquare, ClipboardList, CalendarDays, Search, Palette, FileText } from 'lucide-react';

const toolIconMapSmall = {
  summary: <BookOpen size={24} className="text-green-500" />,
  activity: <PenSquare size={24} className="text-sky-500" />,
  lessonPlan: <ClipboardList size={24} className="text-pink-500" />,
  planningAssistant: <CalendarDays size={24} className="text-purple-500" />,
  caseStudy: <Search size={48} className="text-indigo-500" />,
  presentation: <Palette size={24} className="text-orange-500" />,
  default: <FileText size={24} className="text-slate-500" />
};

export default toolIconMapSmall;