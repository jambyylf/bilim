import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Mux from '@mux/mux-node'

// Mux webhook — видео өңделіп дайын болғанда шақырылады
export async function POST(req: NextRequest) {
  const body = await req.text()

  // Webhook қолтаңбасын тексеру
  const webhookSecret = process.env.MUX_WEBHOOK_SECRET
  if (webhookSecret) {
    try {
      const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID!, tokenSecret: process.env.MUX_TOKEN_SECRET! })
      mux.webhooks.verifySignature(body, req.headers as any, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  // video.asset.ready — видео ойнатуға дайын
  if (event.type === 'video.asset.ready') {
    const asset = event.data
    const uploadId: string | undefined = asset.upload_id
    const assetId: string = asset.id
    const playbackId: string | undefined = asset.playback_ids?.[0]?.id

    if (uploadId && playbackId) {
      await (supabase as any)
        .from('lessons')
        .update({ mux_asset_id: assetId, mux_playback_id: playbackId })
        .eq('mux_upload_id', uploadId)
    }
  }

  // video.upload.asset_created — upload нөмірі → asset нөміріне байланысты
  if (event.type === 'video.upload.asset_created') {
    const uploadId: string = event.data.id
    const assetId: string = event.data.asset_id
    if (uploadId && assetId) {
      await (supabase as any)
        .from('lessons')
        .update({ mux_asset_id: assetId })
        .eq('mux_upload_id', uploadId)
    }
  }

  return NextResponse.json({ ok: true })
}
