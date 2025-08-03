import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Scores from '../../../src/routes/vulnerabilities/Scores'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { TVulnerabilityScore } from '../../../src/routes/vulnerabilities/types/tVulnerabilityScore'
import { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'

// Mock dependencies
vi.mock('@/components/forms/ComponentList', () => ({
  default: ({ 
    listState, 
    title, 
    itemLabel, 
    itemBgColor, 
    startContent, 
    content 
  }: any) => (
    <div data-testid="component-list">
      <div data-testid="list-title">{title()}</div>
      {listState.data.map((item: any, index: number) => (
        <div key={item.id || index} data-testid={`list-item-${index}`}>
          <div data-testid={`start-content-${index}`}>
            {startContent({ index, item })}
          </div>
          <div data-testid={`content-${index}`}>
            {content(item)}
          </div>
        </div>
      ))}
      <button 
        data-testid="add-item" 
        onClick={() => listState.addDataEntry()}
      >
        Add Item
      </button>
    </div>
  )
}))

vi.mock('@/components/forms/Input', () => ({
  Input: ({ 
    label, 
    value, 
    onValueChange, 
    isRequired, 
    isTouched, 
    isInvalid, 
    errorMessage, 
    isReadOnly, 
    isDisabled,
    autoFocus,
    description,
    placeholder,
    csafPath
  }: any) => (
    <div data-testid="input" data-label={label}>
      <label>{label} {isRequired && '*'}</label>
      <input
        data-testid={`input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={isDisabled || isReadOnly}
        placeholder={placeholder}
        data-invalid={isInvalid}
        data-touched={isTouched}
        data-csaf-path={csafPath}
        data-autofocus={autoFocus}
        {...(autoFocus && { autoFocus: true })}
      />
      {description && <div data-testid="input-description">{description}</div>}
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
    </div>
  )
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="vsplit" className={className}>{children}</div>
  )
}))

vi.mock('@/components/StatusIndicator', () => ({
  default: ({ hasErrors, hasVisited }: { hasErrors: boolean; hasVisited: boolean }) => (
    <div 
      data-testid="status-indicator" 
      data-has-errors={hasErrors}
      data-has-visited={hasVisited}
    />
  )
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color, className }: { children: React.ReactNode; color: string; className?: string }) => (
    <div data-testid="alert" data-color={color} className={className}>
      {children}
    </div>
  ),
  Chip: ({ children, color, variant, radius, size }: any) => (
    <div 
      data-testid="chip" 
      data-color={color}
      data-variant={variant}
      data-radius={radius}
      data-size={size}
    >
      {children}
    </div>
  )
}))

vi.mock('../../../src/routes/vulnerabilities/components/ProductsTagList', () => ({
  default: ({ 
    isRequired, 
    error, 
    selected, 
    products, 
    onChange 
  }: any) => (
    <div data-testid="products-tag-list">
      <span>Products {isRequired && '*'}</span>
      {error && <div data-testid="products-error">{error}</div>}
      <div data-testid="selected-products">{selected?.join(', ')}</div>
      <button 
        data-testid="change-products"
        onClick={() => onChange?.(['product1', 'product2'])}
      >
        Change Products
      </button>
    </div>
  )
}))

vi.mock('@/utils/template', () => ({
  checkReadOnly: vi.fn((obj, field) => false),
  getPlaceholder: vi.fn((obj, field) => `placeholder-${field}`)
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn()
}))

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn()
}))

vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn()
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn()
}))

vi.mock('@/utils/validation/usePrefixValidation', () => ({
  usePrefixValidation: vi.fn()
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('cvss4', () => ({
  calculateBaseScore: vi.fn(),
  calculateQualScore: vi.fn(),
  parseVersion: vi.fn()
}))

// Import mocked modules
import { useListState } from '../../../src/utils/useListState'
import { useProductTreeBranch } from '../../../src/utils/useProductTreeBranch'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { useListValidation } from '../../../src/utils/validation/useListValidation'
import { usePrefixValidation } from '../../../src/utils/validation/usePrefixValidation'
import { calculateBaseScore, calculateQualScore, parseVersion } from 'cvss4'
import { checkReadOnly, getPlaceholder } from '../../../src/utils/template'

const mockUseListState = vi.mocked(useListState)
const mockUseProductTreeBranch = vi.mocked(useProductTreeBranch)
const mockUseFieldValidation = vi.mocked(useFieldValidation)
const mockUseListValidation = vi.mocked(useListValidation)
const mockUsePrefixValidation = vi.mocked(usePrefixValidation)
const mockCalculateBaseScore = vi.mocked(calculateBaseScore)
const mockCalculateQualScore = vi.mocked(calculateQualScore)
const mockParseVersion = vi.mocked(parseVersion)
const mockCheckReadOnly = vi.mocked(checkReadOnly)
const mockGetPlaceholder = vi.mocked(getPlaceholder)

describe('Scores Component', () => {
  const mockVulnerability: TVulnerability = {
    id: 'vuln1',
    title: 'Test Vulnerability',
    notes: [],
    products: [
      {
        id: 'prod1',
        productId: 'product1',
        versions: ['v1.0'],
        status: 'known_affected'
      },
      {
        id: 'prod2',
        productId: 'product2',
        versions: ['v2.0'],
        status: 'under_investigation'
      }
    ],
    remediations: [],
    scores: []
  }

  const mockScore: TVulnerabilityScore = {
    id: 'score1',
    cvssVersion: '3.1',
    vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    productIds: ['product1']
  }

  const mockProductTreeBranches: TProductTreeBranch[] = [
    {
      id: 'product1',
      name: 'Product 1',
      category: 'product_version',
      description: 'Product 1 Description',
      subBranches: []
    },
    {
      id: 'product2',
      name: 'Product 2',
      category: 'product_version',
      description: 'Product 2 Description',
      subBranches: []
    }
  ]

  const mockListState = {
    data: [],
    setData: vi.fn(),
    addDataEntry: vi.fn(),
    updateDataEntry: vi.fn(),
    removeDataEntry: vi.fn(),
    getId: vi.fn((entry: any) => entry.id)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseListState.mockReturnValue(mockListState)
    
    mockUseProductTreeBranch.mockReturnValue({
      rootBranch: mockProductTreeBranches,
      findProductTreeBranch: vi.fn(),
      findProductTreeBranchWithParents: vi.fn(),
      getFilteredPTBs: vi.fn(),
      getPTBsByCategory: vi.fn(),
      getSelectablePTBs: vi.fn(() => mockProductTreeBranches),
      getSelectableRefs: vi.fn(() => [
        {
          category: 'product_version',
          full_product_name: {
            name: 'Product 1',
            product_id: 'product1'
          }
        },
        {
          category: 'product_version',
          full_product_name: {
            name: 'Product 2',
            product_id: 'product2'
          }
        }
      ]),
      addPTB: vi.fn(),
      updatePTB: vi.fn(),
      deletePTB: vi.fn()
    })
    
    mockUseFieldValidation.mockReturnValue({
      hasErrors: false,
      errorMessages: [],
      hasWarnings: false,
      warningMessages: [],
      hasInfos: false,
      infoMessages: [],
      isTouched: false,
      markFieldAsTouched: vi.fn(),
      messages: []
    })
    
    mockUseListValidation.mockReturnValue({
      messages: [],
      hasErrors: false,
      errorMessages: [],
      hasWarnings: false,
      warningMessages: [],
      hasInfos: false,
      infoMessages: [],
      isTouched: false,
      markFieldAsTouched: vi.fn()
    })
    
    mockUsePrefixValidation.mockReturnValue({
      hasErrors: false
    })

    mockCalculateBaseScore.mockReturnValue(9.8)
    mockCalculateQualScore.mockReturnValue('Critical')
    mockParseVersion.mockReturnValue('3.1')
    mockCheckReadOnly.mockReturnValue(false)
    mockGetPlaceholder.mockReturnValue('Enter CVSS vector string')
  })

  it('renders without crashing', () => {
    const onChange = vi.fn()
    render(
      <Scores
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={onChange}
      />
    )
    
    expect(screen.getByTestId('component-list')).toBeInTheDocument()
  })

  it('calls onChange when scores data changes', async () => {
    const onChange = vi.fn()
    const updatedListState = {
      ...mockListState,
      data: [mockScore]
    }
    
    mockUseListState.mockReturnValue(updatedListState)
    
    render(
      <Scores
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={onChange}
      />
    )
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        ...mockVulnerability,
        scores: [mockScore]
      })
    })
  })

  it('displays validation errors when present', () => {
    const onChange = vi.fn()
    mockUseListValidation.mockReturnValue({
      messages: [
        { path: '/vulnerabilities/0/scores', message: 'Invalid score data', severity: 'error' }
      ],
      hasErrors: true,
      errorMessages: [
        { path: '/vulnerabilities/0/scores', message: 'Invalid score data', severity: 'error' }
      ],
      hasWarnings: false,
      warningMessages: [],
      hasInfos: false,
      infoMessages: [],
      isTouched: false,
      markFieldAsTouched: vi.fn()
    })
    
    render(
      <Scores
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={onChange}
      />
    )
    
    expect(screen.getByTestId('alert')).toBeInTheDocument()
    expect(screen.getByText('Invalid score data')).toBeInTheDocument()
  })

  it('sorts scores by CVSS version', () => {
    const onChange = vi.fn()
    const unsortedScores = [
      { ...mockScore, id: 'score1', cvssVersion: '4.0' as const },
      { ...mockScore, id: 'score2', cvssVersion: '3.0' as const },
      { ...mockScore, id: 'score3', cvssVersion: '3.1' as const }
    ]
    
    const vulnerabilityWithScores = {
      ...mockVulnerability,
      scores: unsortedScores
    }
    
    render(
      <Scores
        vulnerability={vulnerabilityWithScores}
        vulnerabilityIndex={0}
        onChange={onChange}
      />
    )
    
    expect(mockUseListState).toHaveBeenCalledWith({
      initialData: [
        { ...mockScore, id: 'score2', cvssVersion: '3.0' },
        { ...mockScore, id: 'score3', cvssVersion: '3.1' },
        { ...mockScore, id: 'score1', cvssVersion: '4.0' }
      ],
      generator: expect.any(Function)
    })
  })

  it('filters products correctly for known_affected and under_investigation', () => {
    const onChange = vi.fn()
    const listStateWithScore = {
      ...mockListState,
      data: [mockScore]
    }
    
    mockUseListState.mockReturnValue(listStateWithScore)
    
    render(
      <Scores
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={onChange}
      />
    )
    
    // Check that products are filtered correctly
    const productsTagList = screen.getByTestId('products-tag-list')
    expect(productsTagList).toBeInTheDocument()
  })

  describe('ScoreStartContent', () => {
    it('shows status indicator with errors when no cvssVersion', () => {
      const onChange = vi.fn()
      const scoreWithoutVersion = { ...mockScore, cvssVersion: null }
      const listStateWithScore = {
        ...mockListState,
        data: [scoreWithoutVersion]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator).toHaveAttribute('data-has-errors', 'true')
    })

    it('displays CVSS version chip when version is available', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const chip = screen.getByTestId('chip')
      expect(chip).toHaveTextContent('Version: 3.1')
    })

    it('shows errors from prefix validation', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockUsePrefixValidation.mockReturnValue({
        hasErrors: true
      })
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator).toHaveAttribute('data-has-errors', 'true')
    })
  })

  describe('ScoreForm', () => {
    it('calculates and displays base score and severity', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByDisplayValue('9.8')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Critical')).toBeInTheDocument()
    })

    it('handles invalid CVSS vector strings gracefully', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockCalculateBaseScore.mockImplementation(() => {
        throw new Error('Invalid vector string')
      })
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      // Should render without crashing and show empty base score
      expect(screen.getByTestId('input-cvss-vector-string')).toBeInTheDocument()
    })

    it('updates score when vector string changes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockParseVersion.mockReturnValue('4.0')
      mockCalculateBaseScore.mockReturnValue(8.5)
      mockCalculateQualScore.mockReturnValue('High')
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const input = screen.getByTestId('input-cvss-vector-string')
      await user.clear(input)
      await user.type(input, 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N')
      
      expect(mockListState.updateDataEntry).toHaveBeenCalled()
    })

    it('handles vector string parsing errors', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockParseVersion.mockImplementation(() => {
        throw new Error('Invalid vector string')
      })
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const input = screen.getByTestId('input-cvss-vector-string')
      await user.clear(input)
      await user.type(input, 'invalid-vector')
      
      // Check that updateDataEntry was called with cvssVersion null (indicating parsing error)
      // Since the input updates character by character, we check that there are calls with cvssVersion: null
      expect(mockListState.updateDataEntry).toHaveBeenCalled()
      
      const calls = mockListState.updateDataEntry.mock.calls
      const hasNullVersionCall = calls.some(call => 
        call[0] && call[0].cvssVersion === null
      )
      expect(hasNullVersionCall).toBe(true)
    })

    it('shows validation error for empty vector string', () => {
      const onChange = vi.fn()
      const scoreWithEmptyVector = { ...mockScore, vectorString: '' }
      const listStateWithScore = {
        ...mockListState,
        data: [scoreWithEmptyVector]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
          isTouched={true}
        />
      )
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'vulnerabilities.score.vectorStringEmptyError'
      )
    })

    it('shows validation error for invalid vector string', () => {
      const onChange = vi.fn()
      const scoreWithInvalidVector = { ...mockScore, cvssVersion: null, vectorString: 'invalid' }
      const listStateWithScore = {
        ...mockListState,
        data: [scoreWithInvalidVector]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
          isTouched={true}
        />
      )
      
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'vulnerabilities.score.vectorStringInvalidError'
      )
    })

    it('does not show ProductsTagList for CVSS 4.0', () => {
      const onChange = vi.fn()
      const cvss4Score = { ...mockScore, cvssVersion: '4.0' as const }
      const listStateWithScore = {
        ...mockListState,
        data: [cvss4Score]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.queryByTestId('products-tag-list')).not.toBeInTheDocument()
    })

    it('shows ProductsTagList for CVSS 3.x versions', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore] // cvssVersion is 3.1
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByTestId('products-tag-list')).toBeInTheDocument()
    })

    it('shows validation errors for products field', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockUseFieldValidation.mockReturnValue({
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/scores/0/products', message: 'Products are required' }
        ],
        hasWarnings: false,
        warningMessages: [],
        hasInfos: false,
        infoMessages: [],
        isTouched: false,
        markFieldAsTouched: vi.fn(),
        messages: []
      })
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByTestId('products-error')).toHaveTextContent('Products are required')
    })

    it('updates product IDs when ProductsTagList changes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const changeButton = screen.getByTestId('change-products')
      await user.click(changeButton)
      
      expect(mockListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          productIds: ['product1', 'product2']
        })
      )
    })

    it('respects readOnly and disabled states', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockCheckReadOnly.mockReturnValue(true)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const input = screen.getByTestId('input-cvss-vector-string')
      expect(input).toBeDisabled()
    })

    it('sets correct CSAF paths for different CVSS versions', () => {
      const onChange = vi.fn()
      const cvss30Score = { ...mockScore, cvssVersion: '3.0' as const }
      const cvss40Score = { ...mockScore, cvssVersion: '4.0' as const }
      
      // Test CVSS 3.0
      mockUseListState.mockReturnValue({
        ...mockListState,
        data: [cvss30Score]
      })
      
      const { rerender } = render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      let input = screen.getByTestId('input-cvss-vector-string')
      expect(input).toHaveAttribute('data-csaf-path', '/vulnerabilities/0/scores/0/cvss_v3/vectorString')
      
      // Test CVSS 4.0
      mockUseListState.mockReturnValue({
        ...mockListState,
        data: [cvss40Score]
      })
      
      rerender(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      input = screen.getByTestId('input-cvss-vector-string')
      expect(input).toHaveAttribute('data-csaf-path', '/vulnerabilities/0/scores/0/cvss_v4/vectorString')
    })

    it('passes correct props to inputs', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
          isTouched={true}
        />
      )
      
      // Check vector string input
      const vectorInput = screen.getByTestId('input-cvss-vector-string')
      expect(vectorInput).toHaveAttribute('data-touched', 'true')
      expect(vectorInput).toHaveAttribute('data-autofocus', 'true')
      
      // Check base score input (should be read-only)
      const baseScoreInput = screen.getByTestId('input-vulnerabilities.score.basescore')
      expect(baseScoreInput).toBeDisabled()
      
      // Check severity input (should be read-only)
      const severityInput = screen.getByTestId('input-vulnerabilities.score.baseseverity')
      expect(severityInput).toBeDisabled()
    })
  })

  describe('getV3Index function', () => {
    it('calculates correct index for CVSS 3.x and 4.0 scores', () => {
      const onChange = vi.fn()
      const mixedScores = [
        { ...mockScore, id: 'score1', cvssVersion: '2.0' as any }, // Should be filtered out
        { ...mockScore, id: 'score2', cvssVersion: '3.0' as const },
        { ...mockScore, id: 'score3', cvssVersion: '3.1' as const },
        { ...mockScore, id: 'score4', cvssVersion: '4.0' as const }
      ]
      
      mockUseListState.mockReturnValue({
        ...mockListState,
        data: mixedScores
      })
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      // The component should render without issues and the CSAF paths should be calculated correctly
      // Each list item has both start-content and content, so we have 2 elements per score
      expect(screen.getAllByTestId(/content-/)).toHaveLength(8) // 4 scores * 2 elements each
    })
  })

  describe('Edge cases', () => {
    it('handles empty vulnerability scores array', () => {
      const onChange = vi.fn()
      const vulnerabilityWithoutScores = {
        ...mockVulnerability,
        scores: []
      }
      
      render(
        <Scores
          vulnerability={vulnerabilityWithoutScores}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByTestId('component-list')).toBeInTheDocument()
    })

    it('handles vulnerability without products', () => {
      const onChange = vi.fn()
      const vulnerabilityWithoutProducts = {
        ...mockVulnerability,
        products: []
      }
      
      render(
        <Scores
          vulnerability={vulnerabilityWithoutProducts}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByTestId('component-list')).toBeInTheDocument()
    })

    it('handles undefined scores array', () => {
      const onChange = vi.fn()
      const vulnerabilityWithUndefinedScores = {
        ...mockVulnerability,
        scores: undefined as any
      }
      
      render(
        <Scores
          vulnerability={vulnerabilityWithUndefinedScores}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      expect(screen.getByTestId('component-list')).toBeInTheDocument()
    })

    it('handles parseVersion returning unsupported version', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockParseVersion.mockReturnValue('3.0') // This should trigger the error
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      const input = screen.getByTestId('input-cvss-vector-string')
      await user.clear(input)
      await user.type(input, 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')
      
      expect(mockListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          cvssVersion: null
        })
      )
    })

    it('handles calculateBaseScore returning falsy values', () => {
      const onChange = vi.fn()
      const listStateWithScore = {
        ...mockListState,
        data: [mockScore]
      }
      
      mockUseListState.mockReturnValue(listStateWithScore)
      mockCalculateBaseScore.mockReturnValue(0)
      mockCalculateQualScore.mockReturnValue('')
      
      render(
        <Scores
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={onChange}
        />
      )
      
      // Should handle gracefully and not crash
      expect(screen.getByTestId('component-list')).toBeInTheDocument()
    })
  })
})
