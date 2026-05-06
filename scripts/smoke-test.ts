const API = process.env.API_URL ?? "http://localhost:3000";

const submit = async (taskType: string) => {
  const response = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ taskType, dataset: "iris" }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit task: ${await response.text()}`);
  }
  return (await response.json()) as { taskId: string };
};

const poll = async (taskId: string) => {
  for (let i = 0; i < 30; i += 1) {
    const response = await fetch(`${API}/tasks/${taskId}`);
    const task = await response.json();
    if (task.status === "COMPLETED" || task.status === "FAILED") {
      return task;
    }
    await Bun.sleep(1000);
  }
  throw new Error(`Task ${taskId} did not finish in time`);
};

const main = async () => {
  const taskTypes = ["iris_logreg_train", "iris_random_forest_train", "iris_model_eval"];
  const submitted = await Promise.all(taskTypes.map((taskType) => submit(taskType)));
  const finished = await Promise.all(submitted.map((task) => poll(task.taskId)));
  console.log(JSON.stringify(finished, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
