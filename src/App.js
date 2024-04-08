import './App.css';
import {Button, Divider, Input, Space, Table} from "antd";
import {useEffect, useState} from "react";

function App() {

  const [data, setData] = useState(null);
  const [flagCodeInput, setFlagCodeInput] = useState("")
  const [solutionInput, setSolutionInput] = useState("")
  const [solutionResult, setSolutionResult] = useState("")
  const [solutionHash, setSolutionHash] = useState("")

  useEffect(() => {
    setData(JSON.parse(localStorage.getItem("data") || "[]"))
    console.log(data)
  }, [])

  useEffect(() => {
    if (data !== null)
      saveData()
  }, [data])

  const saveData = () => {
    localStorage.setItem("data", JSON.stringify(data))
  }

  const sha256Hash = async (text) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

  const addFlagCode = () => {
    if (flagCodeInput.length !== 3)
      return
    if (data.find(d => d.flagCode === flagCodeInput)) {
      setFlagCodeInput("")
      return
    }
    setData([...data, {"flagCode": flagCodeInput, "key": flagCodeInput}])
    setFlagCodeInput("")
  }

  const removeFlag = (flagCode) => {
    setData(data.filter(d => d.flagCode !== flagCode))
  }

  const testSolution = () => {
    if (solutionInput.trim() === "") {
      setSolutionInput("")
      setSolutionHash("")
      setSolutionResult("")
      return
    }
    sha256Hash(solutionInput).then(hash => {
      const flagCode = hash.substring(0, 3)
      const flag = hash.substring(3, 16)
      setSolutionHash("Flag " + flagCode + ": " + flag)
      const matchedFlag = data.find(d => d.flagCode === flagCode)
      if (matchedFlag === undefined) {
        setSolutionResult("Solution does not produce matching flag codes")
        return
      }
      setSolutionResult("Congratulations, you have found a flag!")
      setData(data.map(item => {
        if (item.flagCode === flagCode) {
          item.flag = flag
          item.solution = solutionInput
        }
        return item
      }))
      setSolutionInput("")
    })
  }

  const columns = [
    {
      title: "Flag Code",
      dataIndex: "flagCode",
      key: "flag_code"
    },
    {
      title: "Flag",
      dataIndex: "flag",
      key: "flag"
    },
    {
      title: "Solution",
      dataIndex: "solution",
      key: "solution"
    },
    {
      title: "Action",
      dataIndex: "flagCode",
      key: "action",
      render: (text) => (
          <Button onClick={() => removeFlag(text)}>Remove</Button>
      )
    }
  ]

  return (
    <div className="App">
      <h1>INF2215 CTF Flag Tracker</h1>
      <p>Never lose track of your flags again!</p>
      <Divider/>
      <div>
        <h3>Add Flag</h3>
        <p>Add the 3 letter flag code found on the questions here.</p>
        <Space.Compact>
          <Input placeholder='Flag Code "4c6"' value={flagCodeInput} onChange={e => setFlagCodeInput(e.target.value)} onKeyDown={e => {if (e.key === "Enter") addFlagCode()}}/>
          <Button type="primary" onClick={() => addFlagCode()}>Add</Button>
        </Space.Compact>
      </div>
      <div>
        <h3>Solve Flag</h3>
        <p>Enter the solution to any flag here.</p>
        <Space.Compact>
          <Input placeholder='Flag Solution "denver"' value={solutionInput} onChange={e => setSolutionInput(e.target.value)} onKeyDown={e => {if (e.key === "Enter") testSolution()}}/>
          <Button type="primary" onClick={() => testSolution()}>Submit</Button>
        </Space.Compact>
        <p style={{fontWeight: "bold"}}>{solutionHash}</p>
        <p style={{marginBottom: "24px"}}>{solutionResult}</p>
      </div>
      <div>
        <h3>My Flags</h3>
        <Table dataSource={data} columns={columns} />
      </div>
    </div>
  );
}

export default App;
