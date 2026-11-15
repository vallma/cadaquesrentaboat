import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anchor, Gauge, Phone, Ruler, Search, Users } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { getCatalog } from "@/lib/catalog/repository";
import { BoatCard, BoatCardSkeleton } from "@/components/boat/BoatCard";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button, ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { Alert, EmptyState, Skeleton } from "@/components/ui/Feedback";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Field";

export const metadata: Metadata = {
  title: "Guía de estilo",
  robots: { index: false, follow: false },
};

const colors: { name: string; token: string; hex: string; dark?: boolean; use: string }[] = [
  { name: "Navy", token: "navy", hex: "#012840", dark: true, use: "Cabecera, pie, titulares, botón principal" },
  { name: "Navy deep", token: "navy-deep", hex: "#001A2B", dark: true, use: "Barra inferior del pie" },
  { name: "Brand", token: "brand", hex: "#025373", dark: true, use: "Titulares de sección, precios, enlaces" },
  { name: "Brand strong", token: "brand-strong", hex: "#003145", dark: true, use: "Hover y pulsado" },
  { name: "Accent", token: "accent", hex: "#7293B2", dark: true, use: "Detalles sobre navy" },
  { name: "Aqua", token: "aqua", hex: "#2FADC7", use: "Realce puntual" },
  { name: "Tint 50", token: "tint-50", hex: "#E7F0FF", use: "Fondo de sección, botón secundario" },
  { name: "Tint 100", token: "tint-100", hex: "#DAECFF", use: "Hover del secundario" },
  { name: "Tint 200", token: "tint-200", hex: "#C7E1FA", use: "Chips, marcador de imagen" },
  { name: "Surface", token: "surface", hex: "#F2F2F2", use: "Tarjeta del buscador, fondo de listados" },
  { name: "Ink", token: "ink", hex: "#2F2F2F", dark: true, use: "Texto principal" },
  { name: "Ink 2", token: "ink-2", hex: "#474747", dark: true, use: "Texto secundario" },
  { name: "Ink 3", token: "ink-3", hex: "#6B6B6B", dark: true, use: "Texto terciario, bordes de control" },
  { name: "Warn", token: "warn", hex: "#F59E0B", use: "Avisos" },
  { name: "Danger", token: "danger", hex: "#B42318", dark: true, use: "Errores (nuevo)" },
  { name: "Success", token: "success", hex: "#1F7A4D", dark: true, use: "Confirmaciones (nuevo)" },
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 font-display text-heading font-medium text-navy">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-ink-3">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default async function StyleguidePage({ params }: PageProps<"/[locale]/styleguide">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { boats } = await getCatalog();

  return (
    <Container className="py-10">
      <h1 className="font-display text-display font-medium text-navy">Guía de estilo</h1>
      <p className="mb-10 mt-2 max-w-2xl text-ink-2">
        Tokens y componentes comunes de la nueva web. Página interna, no indexada.
      </p>

      <Block title="Color">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map((c) => (
            <li key={c.token} className="overflow-hidden rounded-control border border-line">
              <div
                className={`flex h-20 items-end p-2 font-mono text-xs ${c.dark ? "text-white" : "text-ink"}`}
                style={{ backgroundColor: c.hex }}
              >
                {c.hex}
              </div>
              <div className="p-3">
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="font-mono text-xs text-ink-3">{c.token}</p>
                <p className="mt-1 text-sm text-ink-2">{c.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Tipografía">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-ink-3">Display · Poppins 400 · 28–38 px · títulos de sección</p>
            <p className="font-display text-display text-brand">Embarcacions</p>
          </div>
          <div>
            <p className="text-sm text-ink-3">Title · Poppins 500 · 24–32 px · H1 de portada</p>
            <p className="font-display text-title font-medium text-navy">
              Lloguer d&apos;embarcacions a Cadaqués i Port Lligat
            </p>
          </div>
          <div>
            <p className="text-sm text-ink-3">Heading · Poppins 500 · 24 px · H1 de ficha</p>
            <p className="font-display text-heading font-medium text-navy">Llaüt Passanella</p>
          </div>
          <div>
            <p className="text-sm text-ink-3">Card title · Poppins 400 · 17 px</p>
            <p className="font-display text-card-title text-navy">Beneteau Antares 8</p>
          </div>
          <div>
            <p className="text-sm text-ink-3">Cuerpo · Hanken Grotesk 400 · 16 px</p>
            <p className="max-w-prose">
              La millor manera de gaudir i descobrir les cales del parc natural del Cap de Creus.
            </p>
          </div>
          <div>
            <p className="text-sm text-ink-3">Pequeño · Hanken Grotesk 400 · 14 px</p>
            <p className="text-sm text-ink-2">Combustible no inclòs. Fiança de 500 €.</p>
          </div>
        </div>
      </Block>

      <Block title="Botones">
        <Row label="Variantes">
          <Button>Buscar</Button>
          <Button variant="secondary">Trucar</Button>
          <Button variant="outline">Veure totes</Button>
          <Button variant="ghost">Cancel·lar</Button>
          <span className="rounded-control bg-navy p-2">
            <Button variant="onDark">Sobre navy</Button>
          </span>
        </Row>
        <Row label="Tamaños">
          <Button size="sm">Pequeño</Button>
          <Button size="md">Mediano</Button>
          <Button size="lg">Grande</Button>
        </Row>
        <Row label="Con icono">
          <Button icon={<Search className="size-[1.1em]" aria-hidden />}>Buscar</Button>
          <ExternalButton
            href="#"
            variant="secondary"
            icon={<Phone className="size-[1.1em]" aria-hidden />}
          >
            Trucar
          </ExternalButton>
          <ExternalButton
            href="#"
            variant="secondary"
            icon={<BrandIcon name="whatsapp" className="size-[1.1em]" />}
          >
            WhatsApp
          </ExternalButton>
        </Row>
        <Row label="Estados">
          <Button loading>Cargando</Button>
          <Button disabled>Desactivado</Button>
          <Button variant="secondary" disabled>
            Desactivado
          </Button>
          <ButtonLink href="/" variant="outline">
            Enlace interno
          </ButtonLink>
        </Row>
      </Block>

      <Block title="Chips">
        <Row label="Datos de embarcación">
          <Chip icon={<Users aria-hidden />}>5p</Chip>
          <Chip icon={<Gauge aria-hidden />}>15 cv</Chip>
          <Chip icon={<Ruler aria-hidden />}>4 m</Chip>
        </Row>
        <Row label="Tonos">
          <Chip tone="navy">Sense llicència</Chip>
          <Chip tone="neutral">Port Lligat</Chip>
          <Chip tone="success">Disponible</Chip>
          <Chip tone="warn">Últimes places</Chip>
          <Chip tone="danger">Ocupat</Chip>
        </Row>
      </Block>

      <Block title="Formularios">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <Input label="Nom complet" name="sg-nom" placeholder="Nom i cognoms" required />
          <Input label="Data" name="sg-data" type="date" hint="Tria el dia de sortida." />
          <Select label="Tipus de barca" name="sg-tipus" defaultValue="">
            <option value="">Tots</option>
            <option>Llanxa</option>
            <option>Llaüt</option>
            <option>Semirígida</option>
          </Select>
          <Input
            label="Correu electrònic"
            name="sg-email"
            type="email"
            defaultValue="nom@exemple"
            error="Escriu una adreça de correu vàlida."
          />
          <Input label="Telèfon" name="sg-tel" defaultValue="No editable" disabled />
          <Textarea label="Missatge" name="sg-msg" placeholder="En què et podem ajudar?" />
          <Checkbox
            name="sg-ok"
            className="sm:col-span-2"
            label="He llegit i accepto la política de privacitat."
          />
        </div>
      </Block>

      <Block title="Tarjeta de embarcación">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BoatCard boat={boats[0]} departureName="Cadaqués" />
          <BoatCard boat={boats[8]} departureName="Port Lligat" active note="Disponibilitat per confirmar" />
          <BoatCardSkeleton />
        </div>
      </Block>

      <Block title="Estados y avisos">
        <div className="grid max-w-3xl gap-4">
          <Alert tone="info" title="Garantia meteo disponible">
            Si el mal temps impedeix navegar, busquem una altra data.
          </Alert>
          <Alert tone="success" title="Sol·licitud enviada">
            Rebràs un correu de confirmació.
          </Alert>
          <Alert tone="warn" title="Queden poques franges">
            Només queda la tarda d&apos;aquest dia.
          </Alert>
          <Alert tone="danger" title="No s'ha pogut enviar">
            Revisa la connexió i torna-ho a provar.
          </Alert>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <EmptyState
            icon={<Anchor aria-hidden />}
            title="Cap embarcació amb aquests filtres"
            action={<Button variant="outline">Treure filtres</Button>}
          >
            Prova un altre dia o un altre tipus de barca.
          </EmptyState>
          <div className="space-y-3 rounded-card border border-line p-6">
            <p className="text-sm font-medium text-ink-3">Carga (skeleton)</p>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Block>
    </Container>
  );
}
