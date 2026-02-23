import { retrieveLatestVersion } from '../../../src/utils/csafExport/latestVersion'

describe('retrieveLatestVersion', () => {
    it('should throw an error if history is empty', () => {
        expect(() => retrieveLatestVersion([])).toThrow('Revision history is empty, cannot retrieve latest version.')
    })

    it('should return the latest version based on date', () => {
        const history = [
            { date: '2023-01-01', number: '1.0.0', summary: 'initial' },
            { date: '2023-01-02', number: '1.1.0', summary: 'update' },
            { date: '2023-01-01T12:00:00', number: '1.0.1', summary: 'fix' },
        ]
        // 2023-01-02 is the latest date
        expect(retrieveLatestVersion(history)).toBe('1.1.0')
    })
    
     it('should return the latest version based on date (mixed order)', () => {
        const history = [
            { date: '2023-01-02', number: '1.1.0', summary: 'update' },
             { date: '2023-01-01', number: '1.0.0', summary: 'initial' },
            { date: '2023-01-03', number: '1.2.0', summary: 'latest' },
        ]
        expect(retrieveLatestVersion(history)).toBe('1.2.0')
    })

    it('should fall back to version comparison if dates are equal', () => {
        const history = [
            { date: '2023-01-01', number: '1.0.0', summary: 'old' },
            { date: '2023-01-01', number: '1.1.0', summary: 'new' }, // Higher version
        ]
        expect(retrieveLatestVersion(history)).toBe('1.1.0')
    })

     it('should handle same date/time correctly considering version', () => {
         const now = new Date().toISOString()
        const history = [
            { date: now, number: '1.0.0', summary: 'old' },
            { date: now, number: '1.2.0', summary: 'newest' },
            { date: now, number: '1.1.0', summary: 'new' },
        ]
        expect(retrieveLatestVersion(history)).toBe('1.2.0')
    })
})
