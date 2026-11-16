import { Suspense } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { AUTH_TEXT } from "@/content/auth";
import { LoginForm } from "./LoginForm";

// PAGES.md §6 로그인 `/login`. IA.md §3 "다음 단계" 표에 없는 페이지라 NextStepCTA 없음.
export default function LoginPage() {
  return (
    <PageLayout next={null}>
      <div className="container-page py-9">
        <div className="flex flex-col gap-7 md:w-2/3 lg:w-1/2 xl:w-1/3">
          <SectionHeader as="h1" title={AUTH_TEXT.login.title} />
          {/* ?next= 를 읽으므로 Suspense 안에서 렌더 (cacheComponents) */}
          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}
