import { ActionStream } from "./ActionStream";

const source = {};
const creep = {};

test('Dividing 1 / 1 equals 1', () => {
    ActionStream.encode([{ harvest: source, actor: creep }]);
  expect(div(1, 1)).toBe(1);
});
