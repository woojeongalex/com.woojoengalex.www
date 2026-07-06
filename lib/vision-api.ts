export type VisionAnalyzeResult = {
  id: number
  file_name: string
  label: string
  confidence: number
  analyzed_at: string
}

async function postImageForAnalysis(
  endpoint: string,
  file: File
): Promise<VisionAnalyzeResult> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error(
      '백엔드 서버에 연결하지 못했습니다. 백엔드(8000)가 실행 중인지 확인해 주세요.'
    )
  }

  const raw = await response.text()
  let data: Partial<VisionAnalyzeResult> & { detail?: string }
  try {
    data = raw ? (JSON.parse(raw) as typeof data) : {}
  } catch {
    throw new Error('분석 응답 형식이 올바르지 않습니다.')
  }

  if (!response.ok) {
    const detail = data.detail
    throw new Error(
      typeof detail === 'string' ? detail : '이미지 분석에 실패했습니다.'
    )
  }

  return {
    id: Number(data.id ?? 0),
    file_name: String(data.file_name ?? file.name),
    label: String(data.label ?? ''),
    confidence: Number(data.confidence ?? 0),
    analyzed_at: String(data.analyzed_at ?? ''),
  }
}

export async function analyzeVisionImage(
  file: File
): Promise<VisionAnalyzeResult> {
  return postImageForAnalysis('/api/vision/analyze', file)
}

export async function recognizeFace(file: File): Promise<VisionAnalyzeResult> {
  return postImageForAnalysis('/api/vision/analyze-face', file)
}
