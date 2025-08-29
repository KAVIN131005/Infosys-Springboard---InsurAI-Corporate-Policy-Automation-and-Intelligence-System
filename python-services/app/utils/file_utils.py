import os

def save_file(content, filename):
    path = os.path.join("uploads", filename)
    with open(path, "wb") as f:
        f.write(content)
    return path