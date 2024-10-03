"use client";

import { $authenStore } from "@lib/authenStore";
import { Course } from "@lib/types";

import {
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useStore } from "@nanostores/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentPage() {
  const [myCourses, setMyCourses] = useState<Course[] | null>(null);
  const [loadingMyCourses, setLoadingMyCourses] = useState(false);
  const [courseNo, setCourseNo] = useState("");
  const router = useRouter();

  // get token and authenUsername from global store
  // const { token, authenUsername } = $authenStore.get(); //global store

  const token = localStorage.getItem("token");
  const authenUsername = localStorage.getItem("authenUsername");

  const loadMyCourses = async () => {
    setLoadingMyCourses(true);
    const resp = await axios.get("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMyCourses(resp.data.courses);
    setLoadingMyCourses(false);
  };

  useEffect(() => {
    loadMyCourses();
  }, []);

  const logout = () => {
    router.push("/");
    localStorage.removeItem("token");
    localStorage.removeItem("authenUsername");
  };

  const callEnrollApi = async () => {
    try {
      const resp = await axios.post(
        "/api/enrollments",
        {
          courseNo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourseNo("");
      //load my courses again
      loadMyCourses();
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else alert(error.message);
    }
  };

  return (
    <Stack>
      <Paper withBorder p="md">
        <Group>
          <Title order={4}>Hi,{authenUsername}</Title>
          <Button color="red" onClick={logout}>
            Logout
          </Button>
        </Group>
      </Paper>
      <Paper withBorder p="md">
        <Title order={4}>My Course(s)</Title>

        {myCourses &&
          myCourses.map((course) => (
            <Text key={course.courseNo}>
              {course.courseNo} - {course.title}
            </Text>
          ))}
        {loadingMyCourses && <Loader type="dots" />}
      </Paper>

      <Paper withBorder p="md">
        <Title order={4}> Enroll a Course</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            callEnrollApi();
          }}
        >
          <Group>
            <TextInput
              placeholder="6 Digits Course No."
              maxLength={6}
              minLength={6}
              pattern="^[0-9]*$"
              required
              onChange={(e) => setCourseNo(e.target.value)}
              value={courseNo}
            />
            <Button type="submit">Enroll</Button>
          </Group>
        </form>
      </Paper>
    </Stack>
  );
}
