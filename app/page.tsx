"use client"

import Link from "next/link"
import { ArrowRight, AudioLines, Music4 } from "lucide-react"
import { GeminiChat } from "@/components/gemini-chat"
import { IuemGuideCarousel } from "@/components/iuem-guide-carousel"
import { WeeklyKingBanner } from "@/components/weekly-king-banner"

const feedbackSamples = [
  {
    title: "음정 정확도 분석",
    description:
      "구간별 피치 안정성을 추적해 흔들리는 음, 밀리는 음, 지나치게 높은 음을 잡아냅니다.",
  },
  {
    title: "박자 정밀도 분석",
    description:
      "원곡 BPM과 사용자의 발성을 비교해 박자가 빨라지는 구간과 늦어지는 구간을 알려줍니다.",
  },
  {
    title: "AI 코칭 피드백",
    description:
      "호흡, 발성, 강세, 프레이징을 함께 분석해 다음 연습 포인트를 자연어로 제안합니다.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden bg-white text-zinc-950">
      <section className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:gap-10 md:py-12">
          <div className="max-w-[34rem]">
            <h1
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl"
            >
              노래를 고르고,
              <br />
              부르면서 AI로
              <br />
              음정과 박자를 분석하세요.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-zinc-600 sm:text-lg">
              사용자가 선택한 가요나 뮤지컬 넘버를 AI가 분석하고,
              <br className="hidden sm:block" />
              내장 마이크로 부른 결과를 바탕으로 음정과 박자 정확도,
              <br className="hidden sm:block" />
              그리고 다음 연습을 위한 코칭 피드백까지 제공합니다.
              <br className="hidden sm:block" />
              추후에는 기타와 피아노 같은 악기 튜닝 기능까지
              <br className="hidden sm:block" />
              하나의 서비스로 확장될 수 있도록 설계된 홈 화면입니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/analyze"
                className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm transition-colors hover:bg-zinc-100"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  보컬 배너
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-zinc-950">
                  가요 + 뮤지컬
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-600 sm:text-base">
                  사용자가 선택한 가요와 뮤지컬 넘버를 기반으로
                  <br className="hidden sm:block" />
                  음정, 박자, 발성 안정성을 분석하고
                  <br className="hidden sm:block" />
                  AI 피드백까지 받을 수 있습니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600">
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    K-Pop Analysis
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    Musical Number
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    Vocal Feedback
                  </span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  보컬 상세 보기
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/instrument"
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:bg-zinc-50"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Music4 className="h-4 w-4" aria-hidden="true" />
                  악기 배너
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-zinc-950">
                  기타 + 피아노
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-600 sm:text-base">
                  보컬 분석뿐 아니라 기타와 피아노 같은 악기의
                  <br className="hidden sm:block" />
                  음정 상태와 튜닝 정확도도 확인할 수 있도록
                  <br className="hidden sm:block" />
                  서비스가 확장될 예정입니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600">
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                    Guitar Tuning
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                    Piano Pitch Check
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                    Instrument Support
                  </span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  악기 상세 보기
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-8 w-full max-w-xl md:mt-16 md:sticky md:top-32 lg:mt-20">
            <GeminiChat layout="sidebar" />
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 md:items-start">
            <WeeklyKingBanner />
            <IuemGuideCarousel />
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-zinc-500">AI가 제공할 분석</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                단순 점수만이 아니라, 왜 흔들렸는지까지 설명하는 보컬 피드백
              </h2>
            </div>
            <div className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600">
              백엔드 연동 예정 기능
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {feedbackSamples.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-zinc-200 bg-white p-6"
              >
                <AudioLines className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold text-zinc-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-[2rem] bg-zinc-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-medium text-zinc-400">다음 단계</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                선택한 노래, 사용자 음성, 분석 결과가 하나의 경험으로 이어지는 홈 화면
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
                추후 백엔드가 연결되면 가요와 뮤지컬 넘버를 아우르는 곡 선택 API, 마이크 입력
                업로드, 음정/박자 정확도 분석, 그리고 자연어 피드백 결과를 이 홈 화면에서 바로
                보여줄 수 있도록 설계했습니다.
              </p>
            </div>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              기능 시나리오 확인
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
