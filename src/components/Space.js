import React from "react";
import { useParams } from "react-router-dom";
import { Game } from "./Game";

export function Space() {
  // we use the `useParams` hook here to access the spaceId
  // spaceId === `/space/:spaceId`
  // is currently being sent to Game component as props
  let { id } = useParams();
  return <Game spaceId={id} />;
}
