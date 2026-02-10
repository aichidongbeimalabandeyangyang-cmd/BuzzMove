export interface KlingImageToVideoRequest {
  model_name: string;
  image: string; // URL of the uploaded image
  prompt?: string;
  negative_prompt?: string;
  duration: "5" | "10";
  mode: "pro";
  sound?: "on" | "off";
  cfg_scale?: number;
  callback_url?: string;
}

export interface KlingTaskResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: "submitted" | "processing" | "succeed" | "failed";
    task_status_msg?: string;
    created_at: number;
    updated_at: number;
  };
}

export interface KlingTaskResult {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: "submitted" | "processing" | "succeed" | "failed";
    task_status_msg?: string;
    created_at: number;
    updated_at: number;
    task_result?: {
      videos: Array<{
        id: string;
        url: string;
        duration: string;
      }>;
    };
  };
}

export interface KlingCallbackPayload {
  task_id: string;
  task_status: "succeed" | "failed";
  task_status_msg?: string;
  task_result?: {
    videos: Array<{
      id: string;
      url: string;
      duration: string;
    }>;
  };
}
