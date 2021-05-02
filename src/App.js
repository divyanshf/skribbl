import Home from './components/Home'
import { UserProvider } from './context/UserContext';
import { UsersProvider } from './context/UsersContext';

function App() {
  return (
    <div className="App">
      <UsersProvider>
        <UserProvider>
          <Home />
        </UserProvider>
      </UsersProvider>
    </div>
  );
}

export default App;
