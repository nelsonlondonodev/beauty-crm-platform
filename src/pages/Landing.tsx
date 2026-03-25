import { ArrowRight, CalendarCheck, CheckCircle2, ChevronRight, Scissors, Store, Users, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 selection:bg-primary/20">
      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Londy
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#caracteristicas" className="hover:text-primary transition-colors">Características</a>
            <a href="#beneficios" className="hover:text-primary transition-colors">Beneficios</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="group flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Acceder al Sistema</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 flex justify-center">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                La nueva era para salones y spas ✨
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Digitaliza la belleza, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                multiplica tus ventas.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Un CRM todo en uno. Agenda inteligente, punto de venta ecológico, cálculo automático de comisiones y motores de fidelización que harán que tus clientes vuelvan.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:bg-gray-800 hover:scale-105"
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#caracteristicas"
                className="text-sm font-semibold leading-6 text-gray-900 transition-colors hover:text-primary"
              >
                Ver funcionalidades <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="caracteristicas" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-base font-semibold leading-7 text-primary">Operación Perfecta</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para tu peluquería o spa
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Despídete del papel y la libreta. Londy centraliza tu operativa diaria para que tú te enfoques en brindar un servicio de excelencia.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Agenda Inteligente Multi-Staff',
                  description:
                    'Programa citas en un calendario profesional, visualiza el horario de múltiples colaboradores simultáneamente y evita choques.',
                  icon: CalendarCheck,
                },
                {
                  name: 'Punto de Venta e Invoicing',
                  description:
                    'Cobra servicios y productos. Configuración automática de recargos y generación de tickets digitales (cero papel) por WhatsApp.',
                  icon: Store,
                },
                {
                  name: 'Cálculo de Comisiones Automático',
                  description:
                    'Adiós al Excel de fin de mes. El sistema líquida el pago exacto de cada empleado restando adelantos y pagando porcentajes justos.',
                  icon: Users,
                },
              ].map((feature, index) => (
                <div key={feature.name} className="flex flex-col animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${index * 150}ms` }}>
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Value Proposition Section ── */}
      <section id="beneficios" className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.white))] opacity-20"></div>
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"></div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
              Construye lealtad con Análisis Predictivo y Bonos
            </h2>
            <p className="mt-6 text-center text-lg leading-8 text-gray-600">
              No dejes que los clientes se vayan. Londy incluye un potente motor de fidelización para que generes y valides cupones de descuento (Cumpleaños, Bienvenida) a través de QR instántaneo.
            </p>
            <div className="mt-16 flex flex-col gap-8 sm:flex-row sm:justify-center">
              {[
                'Reportes financieros en tiempo real',
                'Valor Total de Vida del Cliente (LTV)',
                'Segmentación de campañas (n8n)',
                'Módulo especializado para Recepcionistas'
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-sm ring-1 ring-gray-100">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer / Bottom CTA ── */}
      <footer className="bg-gray-50 mt-16 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 sm:p-16 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
             {/* Decoraciones de fondo footer */}
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl relative z-10">
              ¿Listo para modernizar tu negocio?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80 relative z-10">
              Inicia sesión ahora y conviértete en el salón que todos recomiendan. Empezar es muy fácil.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 relative z-10">
              <Link
                to="/login"
                className="group flex gap-2 items-center rounded-full bg-white px-8 py-4 text-base font-semibold text-primary shadow-lg hover:bg-gray-50 hover:scale-105 transition-all"
              >
                Acceder al CRM
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
            <p className="text-xs leading-5 text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Londy CRM B2B. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
