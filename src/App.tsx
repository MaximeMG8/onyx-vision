import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Portfolio from "./pages/Portfolio";
import ProjectDashboard from "./pages/ProjectDashboard";
import MasterAnalytics from "./pages/MasterAnalytics";
import NotFound from "./pages/NotFound";
import { useProjectManager } from "@/hooks/useProjectManager";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const {
    projects,
    activeProjectId,
    switchProject,
    createProject,
    deleteProject,
    updateProject
  } = useProjectManager();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/portfolio"
        element={
          <Portfolio
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitchProject={switchProject}
            onCreateProject={createProject}
            onDeleteProject={deleteProject}
            onUpdateProject={updateProject}
          />
        }
      />
      <Route path="/dashboard/:projectId" element={<ProjectDashboard />} />
      <Route path="/master-analytics" element={<MasterAnalytics />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
