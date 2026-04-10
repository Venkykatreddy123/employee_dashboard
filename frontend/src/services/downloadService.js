import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';

/**
 * downloadFile - Universal downloader for Web and Mobile (Capacitor)
 * @param {Blob} blob - The file content as a blob
 * @param {string} fileName - The desired name for the file
 */
export const downloadFile = async (blob, fileName) => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Convert Blob to Base64 (Capacitor Filesystem requires base64)
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        // 2. Write file to device storage
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        // 3. Open the file immediately for user convenience
        await FileOpener.open({
          filePath: savedFile.uri,
          contentType: 'application/pdf'
        });
      };
    } catch (error) {
      console.error('Mobile Download Error:', error);
      throw new Error('Failed to save file to device storage');
    }
  } else {
    // Standard Web Download Logic
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
};
