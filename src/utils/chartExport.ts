import { toPng, toSvg } from 'html-to-image';

/**
 * 匯出圖表為圖片
 * @param element - 要匯出的 DOM 元素
 * @param filename - 檔案名稱
 * @param format - 匯出格式 ('png' | 'svg')
 */
export async function exportChartAsImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'svg'
): Promise<void> {
  try {
    const dataUrl = format === 'png'
      ? await toPng(element, { quality: 0.95 })
      : await toSvg(element);

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
