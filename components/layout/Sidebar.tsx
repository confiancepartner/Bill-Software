"use client";

export interface SidebarModule {
  key: string;
  label: string;
  description: string;
}

interface SidebarProps {
  modules: SidebarModule[];
  activeModule: string;
  onChange: (moduleKey: string) => void;
}

export default function Sidebar({
  modules,
  activeModule,
  onChange,
}: SidebarProps) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
          Workspace
        </h2>
      </div>
      <div className="space-y-2">
        {modules.map((module) => {
          const isActive = module.key === activeModule;
          return (
            <button
              key={module.key}
              onClick={() => onChange(module.key)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                isActive
                  ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                  : "border-transparent bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-white"
              }`}
            >
              <div className="font-semibold">{module.label}</div>
              <div className="mt-1 text-xs text-gray-500">
                {module.description}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
