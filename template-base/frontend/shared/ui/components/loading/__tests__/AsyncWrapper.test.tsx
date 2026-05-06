import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AsyncWrapper } from "../AsyncWrapper"

describe('AsyncWrapper', () => {
  it('should render children when not loading and no error', () => {
    render(
      <AsyncWrapper loading={false}>
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render loading spinner when loading', () => {
    render(
      <AsyncWrapper loading={true}>
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    // LoadingState shows "Loading..." text (may appear multiple times with sr-only)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render custom loading text', () => {
    render(
      <AsyncWrapper loading={true} loadingText="Custom loading...">
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('should render error alert when error exists', () => {
    const error = new Error('Test error');
    
    render(
      <AsyncWrapper loading={false} error={error}>
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render error alert with custom error message', () => {
    render(
      <AsyncWrapper 
        loading={false} 
        errorMessage="Custom error message"
        errorTitle="Custom Error"
      >
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call retry action when retry button is clicked', () => {
    const mockRetry = vi.fn();
    
    render(
      <AsyncWrapper 
        loading={false} 
        errorMessage="Test error"
        retryAction={mockRetry}
        retryText="Retry Now"
      >
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    const retryButton = screen.getByText('Retry Now');
    retryButton.click();

    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it('should render fallback when no children and fallback provided', () => {
    render(
      <AsyncWrapper 
        loading={false}
        fallback={<div data-testid="fallback">Fallback content</div>}
      >
        {null}
      </AsyncWrapper>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AsyncWrapper loading={true} className="custom-class">
        <div>Content</div>
      </AsyncWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should prioritize loading over error', () => {
    const error = new Error('Test error');
    
    render(
      <AsyncWrapper loading={true} error={error}>
        <div data-testid="content">Test content</div>
      </AsyncWrapper>
    );

    // LoadingState shows text (may appear with sr-only)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});