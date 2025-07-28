// Mock integrations to replace Base44 SDK integrations

class MockCore {
  static async InvokeLLM(options = {}) {
    // Mock LLM response for craving support
    const mockResponses = [
      "Take a deep breath. This craving will pass in just a few minutes.",
      "Remember why you started this journey. You're stronger than this urge.",
      "Try drinking a glass of water or going for a short walk instead.",
      "Think about how good you'll feel tomorrow knowing you stayed strong today.",
      "This feeling is temporary, but your progress is permanent."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return {
      response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      success: true
    };
  }

  static async SendEmail(options = {}) {
    // Mock email sending
    console.log('Mock email sent:', options);
    return {
      success: true,
      message: 'Email sent successfully (mock)'
    };
  }

  static async UploadFile(file) {
    // Mock file upload
    return {
      success: true,
      url: `mock://uploaded-file-${Date.now()}`,
      filename: file.name
    };
  }

  static async GenerateImage(options = {}) {
    // Mock image generation
    return {
      success: true,
      url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(options.prompt || 'Generated Image')}`,
      prompt: options.prompt
    };
  }

  static async ExtractDataFromUploadedFile(fileUrl) {
    // Mock data extraction
    return {
      success: true,
      data: {
        text: 'Mock extracted text from file',
        metadata: {
          fileType: 'text/plain',
          extractedAt: new Date().toISOString()
        }
      }
    };
  }
}

export const Core = MockCore;
export const InvokeLLM = MockCore.InvokeLLM;
export const SendEmail = MockCore.SendEmail;
export const UploadFile = MockCore.UploadFile;
export const GenerateImage = MockCore.GenerateImage;
export const ExtractDataFromUploadedFile = MockCore.ExtractDataFromUploadedFile;