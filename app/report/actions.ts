'use server';

import { createClient } from '@/lib/supabase/server';
import { getFarmIdFromCookie } from '@/lib/utils/get-farm-id';
import { Database } from '@/types/supabase/schema';
import { revalidatePath } from 'next/cache';
import type { DisplayCondition } from './components/display-conditions-dialog';

// テンプレート保存の型定義を更新
interface SaveTemplateParams {
  templateName: string;
  template: any;
  templatePresetKey?: string;
  elementDisplaySettings?: Record<string, DisplayCondition>;
  columnMapping?: { targetColumn: string; sourceColumn: string }[];
  pageSize?: number;
  farmId?: string;
  templateId?: string;
}

// テンプレートを保存
export async function saveTemplate({
  templateName,
  template,
  templatePresetKey,
  elementDisplaySettings,
  columnMapping,
  pageSize,
  farmId,
  templateId,
}: SaveTemplateParams) {
  console.log('サーバー: saveTemplate関数が呼び出されました', {
    templateName,
    hasTemplate: !!template,
    templatePresetKey,
    hasElementDisplaySettings: !!elementDisplaySettings,
    elementDisplaySettingsType: typeof elementDisplaySettings,
    elementDisplaySettingsValue: elementDisplaySettings,
    hasColumnMapping: !!columnMapping,
    columnMappingValue: columnMapping,
    hasPageSize: pageSize !== undefined,
    pageSize,
    farmId,
    templateId,
  });

  // 表示設定のNULLチェックと詳細ログ
  const finalElementDisplaySettings = elementDisplaySettings || {};
  const settingsCount = Object.keys(finalElementDisplaySettings).length;
  console.log(
    `サーバー: 表示設定の項目数: ${settingsCount}`,
    finalElementDisplaySettings
  );

  const farmIdFromCookie = await getFarmIdFromCookie();
  const finalFarmId = farmId || farmIdFromCookie;

  console.log('サーバー: 使用するfarmId:', finalFarmId);

  if (!finalFarmId) {
    return { error: '農場が選択されていません' };
  }

  const supabase = await createClient();

  // ユーザー情報取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'ユーザーが認証されていません' };
  }

  const now = new Date().toISOString();

  // 更新または新規作成
  if (templateId) {
    // 更新
    const { data, error } = await supabase
      .from('pdf_template')
      .update({
        template_name: templateName,
        template,
        template_preset_key: templatePresetKey,
        element_display_settings: finalElementDisplaySettings,
        column_mapping: columnMapping || [],
        page_size: pageSize || 10,
        farm_id: finalFarmId,
        updated_at: now,
      })
      .eq('id', templateId)
      .select();

    console.log('サーバー: 更新結果', {
      success: !error,
      error: error?.message,
      savedSettings: finalElementDisplaySettings,
    });

    if (error) return { error: error.message };
    revalidatePath('/report/generate');
    return { data };
  } else {
    // 新規作成
    const newTemplate: Database['public']['Tables']['pdf_template']['Insert'] =
      {
        template_name: templateName,
        template,
        template_preset_key: templatePresetKey,
        element_display_settings: finalElementDisplaySettings,
        column_mapping: columnMapping || [],
        page_size: pageSize || 10,
        farm_id: finalFarmId,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      };

    console.log('サーバー: 新規作成データ', newTemplate);

    const { data, error } = await supabase
      .from('pdf_template')
      .insert(newTemplate)
      .select();

    console.log('サーバー: 作成結果', {
      success: !error,
      error: error?.message,
      data,
      savedSettings: finalElementDisplaySettings,
    });

    if (error) return { error: error.message };
    revalidatePath('/report/generate');
    return { data };
  }
}

// テンプレート一覧の取得
export async function getTemplates(farmId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('pdf_template')
    .select('*')
    .order('last_used_at', { ascending: false });

  if (farmId) {
    query = query.eq('farm_id', farmId);
  }

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data };
}

// テンプレートをIDで取得
export async function getTemplateById(templateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pdf_template')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) return { error: error.message };

  // 最終使用日時を更新
  await supabase
    .from('pdf_template')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', templateId);

  return { data };
}
