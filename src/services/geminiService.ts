import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AudioAnalysisResult, CreativeGeneratorRequest } from "../types";

let cachedSystemKey: string | null = null;

// Helper to get client dynamically (Async)
const getAiClient = async (): Promise<GoogleGenAI> => {
    // 1. 优先读取本地用户设置的 Key
    const userKey = localStorage.getItem('gemini_api_key');
    if (userKey) {
        return new GoogleGenAI({ apiKey: userKey });
    }

    // 2. 如果本地没有，尝试获取系统预置 Key (Cloudflare Env Var)
    // Cache it so we don't fetch every time
    if (!cachedSystemKey) {
        try {
            const res = await fetch('/api/system-config');
            if (res.ok) {
                const data = await res.json();
                if (data.geminiApiKey) {
                    cachedSystemKey = data.geminiApiKey;
                }
            }
        } catch (e) {
            console.warn("Unable to fetch system configuration:", e);
        }
    }

    if (cachedSystemKey) {
        return new GoogleGenAI({ apiKey: cachedSystemKey });
    }
    
    // 3. 都没有，抛出错误
    throw new Error("未检测到 API Key。请点击右上角设置图标配置您的 Gemini API Key，或联系管理员在后台配置内置 Key。");
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    trackInfo: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "生成的歌曲名称" },
        artist: { type: Type.STRING, description: "生成的虚拟艺术家名称" },
        platform: { type: Type.STRING, description: "来源" }
      },
      nullable: true
    },
    bpm: { type: Type.NUMBER, description: "估算的BPM" },
    key: { type: Type.STRING, description: "音乐调性" },
    timeSignature: { type: Type.STRING, description: "拍号" },
    genre: { type: Type.STRING, description: "主要音乐流派" },
    mood: { type: Type.ARRAY, items: { type: Type.STRING }, description: "情绪关键词 (中文)" },
    instruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "检测到的所有乐器列表（中文）" },
    vocalType: { type: Type.STRING, description: "人声类型描述 (中文)" },
    description: { type: Type.STRING, description: "全曲综合简评 (中文)，描述整体氛围和特色。" },
    rhythmAnalysis: { type: Type.STRING, description: "整体节奏律动分析 (中文)，描述鼓组pattern和贝斯律动。" },
    compositionAnalysis: { type: Type.STRING, description: "整体作曲风格分析 (中文)。" },
    
    // New Section Schema
    sections: {
      type: Type.ARRAY,
      description: "歌曲结构逐段分析。请按时间顺序识别出 Intro, Verse, Chorus, Bridge, Outro 等。",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "段落名称 (例如: Intro, Verse 1, Chorus)" },
          description: { type: Type.STRING, description: "该段落的中文详细描述，包括配器变化、情绪递进。" },
          instruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "该段落中主要活跃的乐器 (中文)" },
          energyLevel: { type: Type.STRING, description: "能量层级" },
          keyElements: { type: Type.STRING, description: "重点复刻特征 (中文)" },
          sunoDirective: { type: Type.STRING, description: "Suno 专用元标签指令 (英文)。**严禁使用圆括号**。直接用纯文本描述该段落的乐器变化或演奏法。例如: 'Music strips back, bass only' 或 'Full orchestral swell, energetic drums'。" },
          lyrics: { type: Type.STRING, description: "该段落的歌词。**必须生成**。如果是 Intro/Outro 等纯音乐段落，请填 '(Instrumental)' 或留空；如果是 Verse/Chorus/Bridge，**必须**根据流派创作完整的、押韵的歌词。" }
        },
        required: ["name", "description", "instruments", "energyLevel", "keyElements", "sunoDirective", "lyrics"]
      }
    },

    productionQuality: { type: Type.STRING },
    danceability: { type: Type.NUMBER },
    energy: { type: Type.NUMBER },
    sunoPrompt: { type: Type.STRING, description: "Suno.ai 'Style of Music' 专用提示词 (英文)。请生成一段长句式、极具描述性的风格指引，重点描述人声细节和乐器氛围。格式参考：'[Vocal Details], in the style of [Artist]. The music is [Genre]. It features [Instrument details], [Rhythmic details]. The mood is [Mood details].'" }
  },
  required: ["bpm", "key", "genre", "mood", "instruments", "description", "rhythmAnalysis", "compositionAnalysis", "sections", "danceability", "energy", "sunoPrompt"],
};

const modelId = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `你是一位世界级的音乐制作人、AI 音乐架构师 (Sonic Architect)。
你的任务是深度解构音乐，并将其转化为可以被 AI (如 Suno.ai, Udio) 理解的生成指令，同时向用户提供专业的中文分析报告。

请严格遵守以下语言规则：
1. **分析类字段 (description, rhythmAnalysis, sections.description, instruments)**：必须使用**中文**。
2. **生成指令类字段 (sunoPrompt, sunoDirective)**：必须使用**英文**，因为 AI 音乐生成器对英文指令理解最好。

关于 "sunoPrompt" (Style of Music) 的特别要求：
不要只给简单的标签列表。请用一段流畅、优雅且专业的英文进行描述。
**必须包含极具画面感的人声描述**。
模板参考: "Sultry female alto vocals with lazy, charming phrasing, airy and breathy, intimate and close-mic'd, with melismatic runs on tail notes, in the style of Huang Ling. The music is upbeat Chinoiserie Funk Pop and Nu-Disco. It features a groovy funk bassline, rhythmic Guzheng stabs, and a sassy Dizi flute hook. The mood is confident and elegantly wild."

关于 "sections.sunoDirective" 的特别要求：
这是合并在段落标签中的指令。**严禁使用圆括号**。请只提供纯文本描述。
它应该描述该段落具体的编曲动作。
错误示例: (Atmospheric synth pads)
正确示例: Atmospheric synth pads fade in, distant percussion
正确示例: Explosive drop, heavy bass, catchy melody
正确示例: Music strips back to just piano and vocals
`;

export const analyzeAudioWithGemini = async (base64Audio: string, mimeType: string): Promise<AudioAnalysisResult> => {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: `请分析这段音频并生成用于复刻的详细数据。遵循 SYSTEM INSTRUCTION 的语言和格式要求。分析内容用中文，Suno指令用英文。`
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3, 
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Gemini 没有返回结果。");
    return JSON.parse(resultText) as AudioAnalysisResult;

  } catch (error) {
    console.error("Gemini Audio Analysis Error:", error);
    throw error;
  }
};

export const analyzeMusicMetadata = async (query: string): Promise<AudioAnalysisResult> => {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: `用户查询： "${query}"。
            请检索该歌曲的录音室版本信息，并生成复刻数据。
            务必完全遵循 SYSTEM INSTRUCTION。分析内容用中文，Suno指令用英文。`
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Gemini 没有返回结果。");
    return JSON.parse(resultText) as AudioAnalysisResult;

  } catch (error) {
    console.error("Gemini Metadata Analysis Error:", error);
    throw error;
  }
};

export const generateCreativeSunoPlan = async (request: CreativeGeneratorRequest): Promise<AudioAnalysisResult> => {
  try {
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: `任务：根据用户的创意概念，设计一首完整的歌曲结构，并生成 Suno AI 提示词和完整歌词。
            
            用户概念 (Concept): "${request.concept}"
            必选风格标签 (Tags): ${request.selectedTags.join(", ")}
            结构模板 (Template): ${request.structureTemplate}
            
            要求：
            1. 发挥你的创造力，想象这是一首由顶级制作人制作的歌曲。
            2. "sunoPrompt" 必须融合用户选定的 Tags，并写成一段极具画面感的英文描述。
            3. "sections" 必须逻辑严密，适合该流派。
            4. **关键要求：** 请同时为每一个有唱段的段落（Verse, Chorus, Bridge）创作高质量的歌词（中文或英文，取决于用户概念语境），并填入 sections.lyrics 字段中。Intro/Outro 如果有旁白也可填入。
            5. 所有描述性文字用中文，Suno指令用英文。
            `
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.85, 
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Gemini 没有返回结果。");
    const result = JSON.parse(resultText) as AudioAnalysisResult;
    
    if (!result.trackInfo) result.trackInfo = { title: "", artist: "", platform: "" };
    result.trackInfo.platform = "Sonic Architect Creative Lab";
    
    return result;

  } catch (error) {
    console.error("Gemini Creative Generation Error:", error);
    throw error;
  }
};

export const generateInstantRemix = async (originalData: AudioAnalysisResult): Promise<AudioAnalysisResult> => {
    try {
        const ai = await getAiClient();
        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [
                    {
                        text: `任务：基于提供的歌曲分析数据，创作一首**风格、速度、调性完全一致，但歌词和主题全新**的歌曲（Remix/同款神曲）。
                        
                        原曲数据：
                        流派: ${originalData.genre}
                        情绪: ${originalData.mood.join(", ")}
                        BPM: ${originalData.bpm}
                        Key: ${originalData.key}
                        
                        **CRITICAL INSTRUCTION (至关重要):**
                        你必须扮演一位金牌作词人。
                        1. **必须生成歌词**：对于 sections 数组中的每一个 Verse, Chorus, Bridge 段落，必须创作全新的、押韵的、高质量歌词，填入 'lyrics' 字段。
                        2. **严禁留空**：不要留空 'lyrics' 字段。不要只写 "(Lyrics go here)"。必须写出真正的歌词。
                        3. **主题重构**：根据原曲的 Mood (情绪) 自动构思一个新的主题（例如：原曲是悲伤分手，新曲可以是雨夜独行；原曲是热血战斗，新曲可以是赛博飙车）。
                        4. **Suno优化**：更新 sunoDirective，使其更适合新的歌词氛围。
                        `
                    }
                ]
            },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.95, // High creativity for new lyrics
            }
        });

        const resultText = response.text;
        if (!resultText) throw new Error("Gemini Remix Error");
        const result = JSON.parse(resultText) as AudioAnalysisResult;

        if (!result.trackInfo) result.trackInfo = { title: "", artist: "", platform: "" };
        result.trackInfo.title = `Remix: ${result.trackInfo.title || "Untitled"}`;
        result.trackInfo.platform = "Sonic Architect AI Remix";
        
        // Preserve original physics if AI drifted too far, but usually let AI decide
        result.bpm = originalData.bpm; 
        result.key = originalData.key;

        return result;
    } catch (e) {
        console.error("Remix generation error", e);
        throw e;
    }
};

export const generateSectionLyrics = async (genre: string, mood: string[], sectionName: string, sectionDesc: string): Promise<string> => {
    try {
        const ai = await getAiClient();
        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [{
                    text: `请为这首歌的 "${sectionName}" 段落生成歌词。
                    
                    歌曲流派: ${genre}
                    情绪: ${mood.join(", ")}
                    段落描述: ${sectionDesc}
                    
                    要求：只有歌词文本，无标签。请创作中文或英文歌词（视流派而定）。`
                }]
            },
            config: {
                temperature: 0.8
            }
        });
        return response.text?.trim() || "";
    } catch (e) {
        console.error("Lyrics gen error", e);
        return "";
    }
}