import { AppWrapper } from '../pages/_app';
import { render } from "@testing-library/react";
import { describe, expect, it } from 'vitest'; // <-- **

describe('AppWrapper', () => {
  it('Appwrapper exists', () => {
    const app = render(<AppWrapper router={{query: {}}} />);
    expect(app).toBeDefined()
  });
});