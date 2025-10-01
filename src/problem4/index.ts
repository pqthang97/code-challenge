/**
 * time complexity: O(n)
 * @param n integer
 * @returns sum of integers from 1 to n
 */
function sum_a_to_n_1(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * time complexity: O(n)
 * @param n integer
 * @returns sum of integers from 1 to n
 */
function sum_a_to_n_2(n: number): number {
  if (n <= 0) {
    return 0;
  }

  return n + sum_a_to_n_2(n - 1);
}

/**
 * time complexity: O(1)
 * @param n integer
 * @returns sum of integers from 1 to n
 */

function sum_a_to_n_3(n: number): number {
  return (n * (n + 1)) / 2;
}

function main() {
  const testCases = [
    {
      input: 5,
      expected: 15
    },
    {
      input: 10,
      expected: 55
    },
    {
      input: 21,
      expected: 231
    }
  ];

  for (let { input, expected } of testCases) {
    console.log(
      `Input: ${input} | Actual: ${sum_a_to_n_1(input)} | Expected: ${expected}`
    );
    console.log(
      `Input: ${input} | Actual: ${sum_a_to_n_2(input)} | Expected: ${expected}`
    );
    console.log(
      `Input: ${input} | Actual: ${sum_a_to_n_3(input)} | Expected: ${expected}`
    );
    console.log("-----------------------------------");
  }
}

main();
