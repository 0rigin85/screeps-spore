export class Hash {
  public static string(value: string) {
    let hash = 5381;
    let length = value.length;

    while (length) {
      hash = (hash * 33) ^ value.charCodeAt(--length);
    }

    return hash >>> 0;
  }
}
