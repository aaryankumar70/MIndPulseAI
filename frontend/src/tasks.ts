import type {
  WellbeingTask,
  TaskActivity,
  WellbeingPlan,
} from './types';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong.';

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getTasks(
  token: string
): Promise<WellbeingTask[]> {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await handleResponse<{
    tasks: WellbeingTask[];
  }>(response);

  return data.tasks;
}

export async function getTaskActivity(
  taskId: string,
  token: string
): Promise<TaskActivity> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/activity`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse<TaskActivity>(response);
}

export async function completeTask(
  taskId: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/complete`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await handleResponse(response);
}

export async function scheduleTask(
  taskId: string,
  scheduledAt: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/schedule`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        scheduled_at: scheduledAt,
      }),
    }
  );

  await handleResponse(response);
}
export async function getPlan(
  token: string
): Promise<WellbeingPlan> {
  const response = await fetch(`${API_URL}/plan`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<WellbeingPlan>(response);
}