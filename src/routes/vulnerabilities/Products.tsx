import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { Select, SelectItem } from '@heroui/select'

export default function Products() {
  return (
    <Table removeWrapper>
      <TableHeader>
        <TableColumn>Product name</TableColumn>
        <TableColumn>First affected version</TableColumn>
        <TableColumn>First fixed version</TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Select>
              <SelectItem key="Product A">Product A</SelectItem>
            </Select>
          </TableCell>
          <TableCell>
            <Select>
              <SelectItem key="3.1">3.1</SelectItem>
            </Select>
          </TableCell>
          <TableCell>
            <Select>
              <SelectItem key="4.5">4.5</SelectItem>
            </Select>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
