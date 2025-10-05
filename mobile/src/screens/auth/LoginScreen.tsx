import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input } from '../../components/ui';
import { login } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { LoginRequest } from '../../types/user';

interface LoginScreenProps {
  navigation: any;
}

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi gereklidir'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre gereklidir'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      Alert.alert(
        'Giriş Hatası',
        error.message || 'Giriş yapılırken bir hata oluştu'
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>
            Teşvik başvuru sisteminize giriş yapın
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-posta Adresi"
                placeholder="ornek@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Şifre"
                placeholder="Şifrenizi giriniz"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <Button
            title="Giriş Yap"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.loginButton}
          />

          <Button
            title="Şifremi Unuttum"
            onPress={navigateToForgotPassword}
            variant="outline"
            style={styles.forgotButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu?</Text>
          <Button
            title="Üye Ol"
            onPress={navigateToRegister}
            variant="outline"
            style={styles.registerButton}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  registerButton: {
    width: '100%',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;