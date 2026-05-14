"use client"

import { Guitar, Music4, Piano, Waves } from "lucide-react"

const instrumentCards = [
  {
    title: "기타 튜닝",
    description:
      "현별 표준 음정과 현재 입력된 음을 비교해 튜닝 오차를 확인합니다.",
    detail: "E A D G B E 기준 튜닝 지원",
    icon: Guitar,
  },
  {
    title: "피아노 음정 체크",
    description:
      "건반 입력 음을 기준 피치와 비교해 안정성과 오차를 분석합니다.",
    detail: "A4 = 440Hz 기준 비교 지원",
    icon: Piano,
  },
]

export default function InstrumentPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Instrument Tuning
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            기타와 피아노를 포함한 악기 튜닝도
            <br />
            하나의 흐름으로 분석합니다.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            보컬 분석과 별개로, 악기 입력 신호를 기준 피치와 비교해 튜닝 정확도를 확인하고
            악기별 피드백을 제공하는 상세 페이지입니다.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {instrumentCards.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="rounded-full bg-zinc-100 p-3 w-fit">
                    <Icon className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-zinc-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{item.description}</p>
                  <p className="mt-4 text-sm font-medium text-zinc-950">{item.detail}</p>
                </article>
              )
            })}
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Music4 className="h-4 w-4" aria-hidden="true" />
                지원 예정 악기
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-700">
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">기타</span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">피아노</span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">베이스</span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">바이올린</span>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Waves className="h-4 w-4" aria-hidden="true" />
                튜닝 분석 방식
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                마이크 또는 라인 입력을 통해 받은 사운드에서 기준 피치를 추출하고, 악기별
                표준 음정과 비교해 튜닝 오차를 계산하는 흐름으로 확장될 수 있습니다.
              </p>
            </article>
          </aside>
        </section>
      </div>
    </main>
  )
}
