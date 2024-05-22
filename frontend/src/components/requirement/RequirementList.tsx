// 1. react 관련
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 2. library
// 3. api
// 4. store
import usePageInfoStore from '@/stores/pageInfoStore';
import userStore from '@/stores/userStore.ts';
// 5. components
// 6. etc
import HistoryIcon from '@/assets/icons/history-line.svg?react';

interface Person {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  role: string;
  isApprovable: 'y' | 'n';
  profileColor: string;
}

interface Detail {
  requirementDetailId: number;
  content: string;
  status: 'u' | 'd';
}

interface Summary {
  requirementId: number;
  orderIndex: number;
  version: string;
  isLock: 'u' | 'l';
  approval: 'u' | 'h' | 'a';
  approvalComment: string | null;
  details: Detail[];
  manager: Person;
  targetUse: string;
  createdAt: string;
  author: Person;
  requirementName: string;
  code: string;
}

interface RequirementListProps {
  requirements: Summary[];
  selectedRequirement: (selectedRequirement: Summary) => void;
}

const RequirementList = ({
  requirements,
  selectedRequirement,
}: RequirementListProps) => {
  const { setPageType } = usePageInfoStore();
  const { employeeId } = userStore();
  const navigate = useNavigate();
  const { projectCode } = usePageInfoStore();
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 처리
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requirements.slice(indexOfFirstItem, indexOfLastItem);
  const handleNext = () => {
    if (currentPage < Math.ceil(requirements.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleConfirm = (requirement: Summary) => {
    selectedRequirement(requirement);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRequirementClick = (
    requirementId: number,
    requirementCode: string,
    requirementName: string,
  ) => {
    if (!requirementId || !projectCode) {
      console.error('Invalid project data');
      return;
    }
    setPageType('requirement', {
      requirementId,
      requirementCode,
      requirementName,
    });

    navigate(`/project/${projectCode}/requirement/${requirementCode}`);
  };

  return (
    <div className='w-full'>
      <div className='mt-4 h-[30rem] w-full overflow-y-auto'>
        <table className='w-full text-center'>
          <thead className='whitespace-nowrap text-lg'>
            <tr>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>
                승인여부
              </th>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>코드</th>
              <th className='sticky top-0 z-[5] bg-gray-200 p-2'>요구사항명</th>
              <th className='sticky top-0 z-[5] bg-gray-200 p-2'>상세설명</th>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>
                담당자
              </th>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>
                작성자
              </th>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>버전</th>
              <th className='sticky top-0 z-[5] bg-gray-200 px-4 py-2'>이력</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((requirement: Summary) => (
              <tr
                className='break border-gray-2000 h-16 cursor-pointer whitespace-normal break-keep border-t hover:bg-gray-100'
                onClick={() =>
                  handleRequirementClick(
                    requirement.requirementId,
                    requirement.code,
                    requirement.requirementName,
                  )
                }
                key={requirement.requirementId}>
                <td className='px-4 py-2'>
                  {requirement.isLock === 'u' ? (
                    <button
                      className='w-24 rounded bg-gray-200 px-3 py-2 text-sm text-white'
                      disabled={true}>
                      승인 요청 전
                    </button>
                  ) : requirement.isLock === 'l' &&
                    requirement.approval === 'u' ? (
                    <button
                      disabled={requirement.manager.employeeId !== employeeId}
                      className='w-24 rounded bg-pubble px-3 py-2 text-sm text-white hover:bg-dpubble disabled:bg-plblue disabled:text-black'
                      onClick={(event) => {
                        event.stopPropagation();
                        handleConfirm(requirement);
                      }}>
                      승인 대기
                    </button>
                  ) : requirement.isLock === 'l' &&
                    requirement.approval === 'h' ? (
                    <button
                      disabled={true}
                      className='w-24 rounded bg-red-600 px-3 py-2 text-sm text-white'>
                      승인 보류
                    </button>
                  ) : requirement.isLock === 'l' &&
                    requirement.approval === 'a' ? (
                    <button
                      disabled={true}
                      className='w-24 rounded bg-green-500 px-3 py-2 text-sm text-white'>
                      승인 완료
                    </button>
                  ) : (
                    <button
                      className='w-24 rounded bg-gray-50 px-3 py-2 text-sm text-gray-200'
                      disabled={true}>
                      상태 미지정
                    </button>
                  )}
                </td>
                <td className='px-4 py-2'>{requirement.code}</td>
                <td className='p-2 px-4'>{requirement.requirementName}</td>
                <td className='px-4 py-2 text-start'>
                  {requirement.details && requirement.details.length > 0 ? (
                    <ul className='list-disc'>
                      {requirement.details.map((detail) => (
                        <li key={detail.requirementDetailId}>
                          {detail.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '상세설명이 없습니다'
                  )}
                </td>
                <td className='px-4 py-2'>{requirement.manager.name}</td>
                <td className='px-4 py-2'>{requirement.author.name}</td>
                <td className='px-4 py-2'>{requirement.version}</td>
                <td
                  className='px-4 py-2'
                  onClick={(event) => event.stopPropagation()}>
                  <div className='flex h-full w-full items-center justify-center'>
                    <HistoryIcon className='h-6 w-6 fill-gray-900/60' />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='my-4 flex w-full justify-end'>
        <button
          className='mr-3 rounded border border-gray-200 bg-white px-4 py-2 disabled:opacity-50'
          onClick={handlePrevious}
          disabled={currentPage === 1}>
          이전
        </button>
        <button
          className='rounded border border-gray-200 bg-white px-4 py-2 disabled:opacity-50'
          onClick={handleNext}
          disabled={
            currentPage >= Math.ceil(requirements.length / itemsPerPage)
          }>
          다음
        </button>
      </div>
    </div>
  );
};

export default RequirementList;
