import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import Login from '@/pages/Login';
import Join from '@/pages/Join';
import NotFound from '@/pages/NotFound';
import Main from '@/pages/Main';
import OauthGithubCallback from '@/pages/OauthGithubCallback';
// import Proof from '@/pages/watering/Proof';
// import ReadPage from '@/pages/watering/ReadPage';
// import WritePage from '@/pages/watering/WritePage';
// import CheckMember from '@/pages/check/CheckMember';
// import Participant from '@/pages/participant/Participant';
// import MyGarden from '@/pages/mygarden/MyGarden';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: 'join',
        element: <Join />,
      },
      {
        path: 'oauth/github',
        element: <OauthGithubCallback />,
      },
      // 로그인 한 사람만 접근 가능
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'main', element: <Main /> },
        //   { path: 'watering', element: <Proof /> },
        //   { path: 'watering/write', element: <WritePage /> },
        //   { path: 'watering/:postId', element: <ReadPage /> },
        //   { path: 'laydown', element: <CheckMember /> },
        //   { path: 'farmer', element: <Participant /> },
        //   { path: 'mygarden', element: <MyGarden /> },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
