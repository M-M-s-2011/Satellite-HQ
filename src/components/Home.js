import React, { useState } from "react";
import { Link } from "react-router-dom";

export function Home() {
  // basic Home Page to make the response of the input the route
  // `/space/:inputResponse(or spaceId)
  // here we use react hooks
  const [spaceId, setSpaceId] = useState("");
  return (
    <div>
      <input
        value={spaceId}
        onChange={(event) => setSpaceId(event.target.value)}
      />
      <Link to={`/space/${spaceId}`}>Go to space</Link>
    </div>
  );
}
