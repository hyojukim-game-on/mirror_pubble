// 1. react 관련
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 2. library 관련
import { FiMoreHorizontal } from 'react-icons/fi';
// 3. api 관련
import { getRequirement } from '@/apis/project';
// 4. store 관련
import usePageInfoStore from '@/stores/pageInfoStore';
// 5. component 관련
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, SortingState, getSortedRowModel, ColumnFiltersState, getFilteredRowModel, VisibilityState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenuLabel, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// usePageInfoStore를 사용하기 위해 새롭게 정의
const usePageStore = usePageInfoStore;
// Requirement type 정의
export type Requirement = {
  description: string; // 요구사항의 설명
  requirementId: number; // 요구사항의 아이디
  orderIndex: number; // 요구사항의 순서
  version: string; // 요구사항의 버전
  isLock: 'u' | 'l'; // 요구사항의 잠금 여부
  approval: 'u' | 'h' | 'a'; // 요구사항의 승인 여부
  approvalComment: string; // 요구사항의 승인 코멘트
  code: string; // 요구사항의 코드
  requirementName: string; // 요구사항의 이름
  detail: string; // 요구사항의 상세설명
  manager: {
    userId: number; // 요구사항의 담당자의 아이디
    name: string; // 요구사항의 담당자의 이름
    employeeId: string; // 요구사항의 담당자의 사번
    department: string; // 요구사항의 담당자의 부서
    position: string; // 요구사항의 담당자의 직위
    role: string; // 요구사항의 담당자의 역할
    isApprovable: 'y' | 'n'; // 요구사항의 담당자의 승인 가능 여부
    profileColor: string; // 요구사항의 담당자의 프로필 색상
  };
};

// RequirementList component의 props 정의
interface RequirementListProps {
  pId: number;
  pCode: string;
  pName: string;
}

// RequirementList component의 columns 정의
export const columns: ColumnDef<Requirement>[] = [
  {
    // 선택된 행의 체크박스
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // 승인여부 컬럼
  {
    accessorKey: 'approvalStatus',
    header: '승인여부',
    cell: (info) => info.getValue(),
  },
  // 잠금여부 컬럼
  {
    accessorKey: 'lockStatus',
    header: '잠금여부',
    cell: (info) => info.getValue(),
  },
  // 항목ID 컬럼
  {
    accessorKey: 'requirementId',
    header: '항목ID',
    cell: (info) => info.getValue(),
  },
  // 요구사항이름 컬럼
  {
    accessorKey: 'requirementName',
    header: '요구사항이름',
    cell: (info) => info.getValue(),
  },
  // 상세설명 컬럼
  {
    accessorKey: 'description',
    header: '상세설명',
    cell: (info) => info.getValue(),
  },
  // 담당자 컬럼
  {
    accessorKey: 'assignee',
    header: '담당자',
    cell: (info) => info.getValue(),
  },
  // 작성자 컬럼
  {
    accessorKey: 'author',
    header: '작성자',
    cell: (info) => info.getValue(),
  },
  // 현재버전 컬럼
  {
    accessorKey: 'currentVersion',
    header: '현재버전',
    cell: (info) => info.getValue(),
  },
  // 액션 컬럼
  {
    id: 'actions',
    cell: ({ row }) => {
      const requirement = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <FiMoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel></DropdownMenuLabel>
            <DropdownMenuItem
              onClick={
                () => console.log(`Delete ${requirement.requirementId}`) // 함수 추가 후 콘솔 로그 삭제예정
              }>
              삭제하기
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={
                () => console.log(`이전 버전확인 ${requirement.requirementId}`) // 함수 추가 후 콘솔 로그 삭제예정
              }>
              버전확인
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


const RequirementList = ({pId,pCode,pName}: RequirementListProps) => {
  const navigate = useNavigate();
  // useState를 통한 상태변화 관리 들어가기
  // 요구사항의 목록
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  // 정렬 상태
  const [sorting, setSorting] = useState<SortingState>([]);
  // column 필터링 상태
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // column 보이기 상태
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  // row 선택 상태
  const [rowSelection, setRowSelection] = useState({});
  // table 상태
  const table = useReactTable({
    data: requirements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
// useEffect를 활용한... 사용자의 요구사항 목록 화면 UI 갱신
  useEffect(() => {
    // fetchProjects 함수 정의
    const fetchRequirements = async () => {
      // 요구사항 목록 데이터 추출
      try {const response = await getRequirement(pId, pCode);
        // 만약 데이터가 있다면
        if (response.data && response.data.length > 0) {
          // 요구사항 목록 데이터 추출
          const requirementData = response.data.map((req: Requirement) => ({
            requirementId: req.requirementId,
            orderIndex: req.orderIndex,
            version: req.version,
            isLock: req.isLock,
            approval: req.approval,
            approvalComment: req.approvalComment,
            code: req.code,
            requirementName: req.requirementName,
            manager: req.manager,
          }));
          // 요구사항 목록 데이터 설정
          setRequirements(requirementData);
          usePageStore.setState({
            requirementId: requirementData[0].requirementId,
            requirementCode: requirementData[0].code,
            requirementName: requirementData[0].requirementName,
          });
        // 데이터가 없는 경우
        } else {
          // 빈 배열로 요구사항 목록 데이터 설정
          setRequirements([]);
        }
        // 에러 발생 시
      } catch (error) {
        console.error('Failed to fetch requirements:', error);
        // 빈 배열로 요구사항 목록 데이터 설정
        setRequirements([]);
      }
    };
    fetchRequirements();
  }, [pId, pCode]);

  const handleRowClick = (requirement: Requirement) => {
    const { requirementId, code } = requirement;
    const rCode = code;
    // 요구사항코드가 존재 하지 않는 경우
    if (!requirementId) {
      // 콘솔에 에러 메시지 반환
      console.error('Invalid requirement data');
      return;
    }
    // 요구사항 코드가 존재하는 경우
    // 요구사항 상세 정보 페이지로 이동
    // 기존에는 state로 정보를 다음 페이지에 넘겼는데, 이제 모두 store 사용하므로 state 파라미터는 사용하지 않음
    navigate(`/project/${pCode}/requirement/${rCode}`, 
    {state: {requirementId}});
  };

  return (
    <div className='p-8 text-center'>
      <p className='mb-4 text-2xl font-bold'>{pName || '예시 프로젝트 제목'}</p>
      <p className='mb-8 text-lg'>프로젝트 기간</p>
      <div className='rounded-md border'>
        <div className='flex items-center px-5 py-5'>
          <Input
            placeholder='요구사항 이름을 입력해주세요.'
            value={(table.getColumn('requirementName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('requirementName')?.setFilterValue(event.target.value)}
            className='max-w-sm text-lg'
          />
          <div className='ml-auto'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='text-lg'>
                  컬럼선택
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {table.getAllColumns().filter((column) => column.getCanHide() && column.id !== 'actions').map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-center text-lg font-semibold'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='text-base'>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} role='button' className='cursor-pointer hover:bg-gray-100'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={() => handleRowClick(row.original)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-center space-x-2 py-4'>
        <Button variant='outline' size='sm' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          이전 페이지
        </Button>
        <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          다음 페이지
        </Button>
      </div>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredRowModel().rows.length} 개 중 {table.getFilteredSelectedRowModel().rows.length} 개 선택됨.
      </div>
    </div>
  );
};

export default RequirementList;
