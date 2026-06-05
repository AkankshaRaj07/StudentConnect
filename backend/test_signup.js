fetch('http://localhost:4000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enrollment_no: "0157CS250001",
    name: "Test User",
    email: "test@test.com",
    password: "password123"
  })
})
.then(async res => {
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
})
.catch(err => console.error("Error:", err));
