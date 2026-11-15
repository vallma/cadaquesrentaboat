import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Section } from "@/components/ui/Section";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Section tone="tint">
      <EmptyState
        icon={<Compass aria-hidden />}
        title={t("title")}
        action={<ButtonLink href="/">{t("cta")}</ButtonLink>}
      >
        {t("body")}
      </EmptyState>
    </Section>
  );
}
