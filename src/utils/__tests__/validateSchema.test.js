/**
 * 用途：对 src/utils/validateSchema.js 进行单元测试
 * 作者：ltx
 * 时间：2025-11-10
 */
import { describe, it, expect } from 'vitest'
import { jsonDiagramIsValid, ddbDiagramIsValid } from '../../utils/validateSchema'

describe('validateSchema', () => {
  it('jsonDiagramIsValid returns boolean', () => {
    const valid = jsonDiagramIsValid({})
    expect(typeof valid).toBe('boolean')
  })

  it('ddbDiagramIsValid returns boolean', () => {
    const valid = ddbDiagramIsValid({})
    expect(typeof valid).toBe('boolean')
  })
})