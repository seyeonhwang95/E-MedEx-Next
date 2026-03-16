import { appShellSections } from '@emedex/domain';
import { Button, Card } from '@emedex/ui-web';

export function App() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            E-MedEx Next
          </p>
          <h1 className="text-4xl font-semibold">Modern medical examiner platform scaffold</h1>
          <p className="max-w-3xl text-slate-600">
            Multi-tenant case management, offline field intake, HL7 integration, and shared design-system packages.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {appShellSections.map((section) => (
            <Card key={section.id} title={section.title} description={section.description} />
          ))}
        </div>

        <div>
          <Button>Open demo workspace</Button>
        </div>
      </section>
    </main>
  );
}