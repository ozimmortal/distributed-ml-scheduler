import json
import sys
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


def run(task_type: str, payload: dict):
    iris = load_iris()
    x_train, x_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=42
    )

    if task_type == "iris_logreg_train":
        model = LogisticRegression(max_iter=200)
    elif task_type == "iris_random_forest_train":
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    elif task_type == "iris_model_eval":
        model = LogisticRegression(max_iter=200)
    else:
        raise ValueError(f"Unsupported task type: {task_type}")

    model.fit(x_train, y_train)
    pred = model.predict(x_test)
    acc = accuracy_score(y_test, pred)
    return {
        "taskType": task_type,
        "dataset": payload.get("dataset", "iris"),
        "accuracy": float(acc),
        "samples": len(y_test),
    }


if __name__ == "__main__":
    task_type = sys.argv[1]
    payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    print(json.dumps(run(task_type, payload)))
