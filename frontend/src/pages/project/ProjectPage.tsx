// 1. react 관련
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
// 2. library
// 3. api
// import { getRequirement } from '@/apis/project';
// 4. store
import usePageInfoStore from "@/stores/pageInfoStore.ts";
// 5. components
import RequirementList from "@/components/requirement/RequirementList"

const ProjectPage =()=>{
  const location = useLocation();
  const { prdId, projectId, projectTitle } = location.state;
  const projectCode = prdId;
  const projectName = projectTitle;
  // store에서 projectId를 업데이트 하는 함수를 가져옴
  const { setProjectId, setProjectCode, setProjectName } = usePageInfoStore();
  // 컴포넌트가 마운트 될 때, projectId 상태를 업데이트
  useEffect(() => {
    setProjectId(projectId);
    setProjectCode(projectCode);
    setProjectName(projectName);
  }, [projectId, projectCode, projectName, setProjectId, setProjectCode, setProjectName]);


  // console.log({"projectId": projectId, "projectCode": projectCode, "projectName": projectName})
  return(
    <div>
      <RequirementList projectId={projectId} projectName={projectName} projectCode={projectCode || '프로젝트 코드 예시' }/>
    </div>  
    ) 

}

export default ProjectPage;