import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy, Matcher } from "jest-mock-extended"

import prisma from "../src/util/db"

jest.mock("../src/util/db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// When mocking a findMany method, you can use the matcher object to specify
// https://github.com/marchaos/jest-mock-extended/issues/44
export const objectWithTheSameFields = <T>(expectedValue: T) =>
  new Matcher<T | unknown>((actualValue: any) => {
    return JSON.stringify(actualValue) == JSON.stringify(expectedValue)
  }, "different fields")
