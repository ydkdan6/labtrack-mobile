import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    // You can also log the error to an error reporting service here
    console.error('Uncaught Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              The application encountered an unexpected error.
            </Text>
          </View>

          <View style={styles.errorCard}>
            <ScrollView style={styles.errorScroll}>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorCard: {
    width: '100%',
    maxHeight: 300,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.errorLight,
    marginBottom: spacing.xl,
  },
  errorScroll: {
    flexGrow: 0,
  },
  errorText: {
    ...typography.bodyBold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  stackText: {
    ...typography.small,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
