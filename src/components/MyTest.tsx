import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Input, Button } from "@nextui-org/react";
import myImage from "../LoginPage/images/myImage.jpg";

const MyTest = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), url(${myImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "min(420px, 92vw)",
          background: "linear-gradient(112deg, rgba(6,183,219,0.18), rgba(255,78,205,0.12), rgba(0,114,245,0.14))",
          backdropFilter: "blur(14px)",
        }}
      >
        <CardHeader style={{ fontWeight: 800, fontSize: 18 }}>Login</CardHeader>

        <CardBody style={{ gap: 12 }}>
          <Input label="Username" placeholder="Enter username" />
          <Input label="Password" placeholder="Enter password" type="password" />
        </CardBody>

        <CardFooter style={{ justifyContent: "flex-end" }}>
          <Button color="primary" size="sm">
            Agree
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MyTest;
