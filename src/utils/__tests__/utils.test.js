/**
 * 用途：对 src/utils/utils.js 中的通用函数进行单元测试
 * 作者：ltx
 * 时间：2025-11-10
 */
import { describe, it, expect } from 'vitest'
import { arrayIsEqual, strHasQuotes, isKeyword, isFunction, getTableHeight } from '../../utils/utils'

describe('utils helpers', () => {
  it('arrayIsEqual should compare arrays by value', () => {
    expect(arrayIsEqual([1,2], [1,2])).toBe(true)
    expect(arrayIsEqual([1,2], [2,1])).toBe(false)
  })

  it('strHasQuotes should detect matching quotes', () => {
    expect(strHasQuotes('"abc"')).toBe(true)
    expect(strHasQuotes('\'abc\'')).toBe(true)
    expect(strHasQuotes('`abc`')).toBe(true)
    expect(strHasQuotes('abc')).toBe(false)
  })

  it('isKeyword should detect SQL keywords', () => {
    expect(isKeyword('NULL')).toBe(true)
    expect(isKeyword('current_date')).toBe(true)
    expect(isKeyword('foo')).toBe(false)
  })

  it('isFunction should detect function pattern', () => {
    expect(isFunction('SUM(id)')).toBe(true)
    expect(isFunction('id')).toBe(false)
  })

  it('getTableHeight should compute height from field count', () => {
    expect(getTableHeight([{},{},{}]) > 0).toBe(true)
  })
})