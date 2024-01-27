import os
import json
import csv
from collections import Counter
from pathlib import Path


root = Path("raw/data")


def process_tokens(root):
    tokens_filename = root / "tokens.csv"

    dictionary = {}

    with open(tokens_filename) as f:
        reader = csv.DictReader(f)

        for row in reader:
            dictionary[int(row["id"])] = row["token"]

    return dictionary


def process_state(root, dictionary):
    state_filename = root / "state.csv"
    output = {}

    with open(state_filename) as f:
        reader = csv.DictReader(f)

        for row in reader:
            topic = int(row["topic"])
            doc = int(row["doc"])
            token = dictionary[int(row["token"])]

            if topic not in output:
                output[topic] = {}
            if doc not in output[topic]:
                output[topic][doc] = {}

            assert token not in output[topic][doc]
            output[topic][doc][token] = int(row["count"])

    return output


def clean_float(value):
    if value == "NA":
        return None
    else:
        return float(value)


def process_topics(root):
    topics_filename = root / "topics.csv"

    results = {}

    with open(topics_filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            iden = int(row["id"])
            results[iden] = {
                "mean": clean_float(row["mean"]),
                "trend": clean_float(row["trend"]),
                "dist": clean_float(row["dist"]),
                "first_key": row["key.0"],
                "id": int(row["id"])
            }

    sorted_keys = {}

    # sort values
    for key in sorted(results.keys()):
        for data_type in results[key].keys():
            if data_type not in sorted_keys:
                sorted_keys[data_type] = []

            sorted_keys[data_type].append(results[key][data_type])

    return sorted_keys


def get_index(topic_x, topic_y, n):
    if topic_x == topic_y:
        return -1

    x = min(topic_x, topic_y)
    y = max(topic_x, topic_y)
    i = (2 * x * n - x**2 + 2 * y - 3 * x - 2) / 2

    return int(i)


def process_distance(root):
    distance_filename = root / "distance.csv"
    output = {}

    with open(distance_filename) as f:
        reader = csv.DictReader(f)
        for x, row in enumerate(reader):
            del row[""]

            for y in row:
                if y == "":
                    continue
                i = get_index(x, int(y), len(row))

                if i in output:
                    assert row[y] == output[i]

                output[i] = row[y]

    del output[-1]

    total = len(output)
    return [output[i] for i in range(total)]


def save_data(token_data, dataset, filename):
    output_filename = Path("galaxy/datasets") / dataset / f"{filename}.json"
    os.makedirs(output_filename.parent, exist_ok=True)

    with open(output_filename, "w") as f:
        json.dump(token_data, f)


def process_documents(root):
    distance_filename = root / "documents.csv"

    document_data = {}
    with open(distance_filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            iden = int(row["id"])
            document_data[iden] = {
                "id": iden,
                "date": row["date"],
                "name": row["name"],
                "tokens": 0,
            }

    # File in document_data with total token counts
    state_filename = root / "state.csv"
    with open(state_filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            document_data[int(row["doc"])]["tokens"] += int(row["count"])

    # Count tokens and documents by date.
    tokens_by_date = Counter()
    documents_by_date = Counter()

    for key, data in document_data.items():
        tokens_by_date[data["date"]] += data["tokens"]
        documents_by_date[data["date"]] += 1

    return document_data, tokens_by_date, documents_by_date


def main(dataset):
    data_root = root / dataset

    # Process main distances and metadata
    token_data = process_topics(data_root)
    token_data["topic_dist"] = process_distance(data_root)
    save_data(token_data, dataset, "topics")

    # # Process documents
    document_data, tokens_by_date, documents_by_date = process_documents(data_root)

    save_data(tokens_by_date, dataset, "token_counts_by_year")
    save_data(documents_by_date, dataset, "doc_counts_by_year")

    # Process token counts
    dictionary = process_tokens(data_root)
    state = process_state(data_root, dictionary)

    for topic in state:
        total_counts = Counter()

        counts_by_date = {}
        document_prominence = Counter()

        for doc in state[topic]:

            document_prominence[doc] = sum(state[topic][doc].values())

            date = document_data[doc]["date"]
            if date not in counts_by_date:
                counts_by_date[date] = Counter()

            for word, count in state[topic][doc].items():
                total_counts[word] += count
                counts_by_date[date][word] += count

        result = {
            "token_counts": [(k, v) for k, v in total_counts.most_common(40)]
        }

        prominences = []
        for key, value in document_prominence.items():

            doc_data = document_data[key]

            prominences.append({
                "volid": key,
                "publishDate": doc_data["date"],
                "title": doc_data["name"],
                "prominence": value / doc_data["tokens"],
            })

        save_data({"doc_prominence": prominences}, dataset, f"{topic}/doc_prominence")
        save_data(result, dataset, f"{topic}/token_counts")
        save_data(counts_by_date, dataset, f"{topic}/token_counts_by_year")


if __name__ == "__main__":
    for i in ["1800", "1900", "gamergate", "mind", "mind-singles"]:
        main(i)
