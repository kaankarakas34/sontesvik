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
import { Button, Input, Picker, PickerOption } from '../../components/ui';
import { registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import { RegisterRequest, UserType, SectorType, SECTOR_LABELS, USER_TYPE_LABELS } from '../../types/user';

interface RegisterScreenProps {
  navigation: any;
}

const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .required('Ad gereklidir'),
  lastName: yup
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .required('Soyad gereklidir'),
  email: yup
    .string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi gereklidir'),
  password: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    )
    .required('Şifre gereklidir'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı gereklidir'),
  userType: yup
    .string()
    .oneOf([UserType.CONSULTANT, UserType.MEMBER], 'Geçerli bir kullanıcı tipi seçiniz')
    .required('Kullanıcı tipi gereklidir'),
  sector: yup
    .string()
    .oneOf(Object.values(SectorType), 'Geçerli bir sektör seçiniz')
    .required('Sektör seçimi gereklidir'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  companyName: yup.string().optional(),
  taxNumber: yup
    .string()
    .matches(/^[0-9]{10,11}$/, 'Vergi numarası 10 veya 11 haneli olmalıdır')
    .optional(),
});

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: UserType.MEMBER,
      sector: SectorType.OTHER,
      phone: '',
      companyName: '',
      taxNumber: '',
    },
  });

  const watchedUserType = watch('userType');

  const userTypeOptions: PickerOption[] = [
    { label: USER_TYPE_LABELS[UserType.MEMBER], value: UserType.MEMBER },
    { label: USER_TYPE_LABELS[UserType.CONSULTANT], value: UserType.CONSULTANT },
  ];

  const sectorOptions: PickerOption[] = Object.entries(SECTOR_LABELS).map(
    ([value, label]) => ({ label, value })
  );

  const onSubmit = async (data: RegisterRequest) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      Alert.alert(
        'Kayıt Başarılı',
        'Hesabınız başarıyla oluşturuldu. E-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Kayıt Hatası',
        error.message || 'Kayıt olurken bir hata oluştu'
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <Text style={styles.title}>Üye Ol</Text>
          <Text style={styles.subtitle}>
            Teşvik başvuru sistemi hesabınızı oluşturun
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Ad"
                  placeholder="Adınız"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  containerStyle={styles.halfInput}
                  leftIcon="person-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Soyad"
                  placeholder="Soyadınız"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  containerStyle={styles.halfInput}
                  leftIcon="person-outline"
                />
              )}
            />
          </View>

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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Şifre Tekrarı"
                placeholder="Şifrenizi tekrar giriniz"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}
          />

          <Controller
            control={control}
            name="userType"
            render={({ field: { onChange, value } }) => (
              <Picker
                label="Kullanıcı Tipi"
                placeholder="Kullanıcı tipi seçiniz"
                options={userTypeOptions}
                selectedValue={value}
                onValueChange={onChange}
                error={errors.userType?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="sector"
            render={({ field: { onChange, value } }) => (
              <Picker
                label="Sektör"
                placeholder="Sektör seçiniz"
                options={sectorOptions}
                selectedValue={value}
                onValueChange={onChange}
                error={errors.sector?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Telefon (Opsiyonel)"
                placeholder="0555 123 45 67"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                leftIcon="call-outline"
                keyboardType="phone-pad"
              />
            )}
          />

          {watchedUserType === UserType.CONSULTANT && (
            <>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Şirket Adı (Opsiyonel)"
                    placeholder="Şirket adınız"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.companyName?.message}
                    leftIcon="business-outline"
                  />
                )}
              />

              <Controller
                control={control}
                name="taxNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Vergi Numarası (Opsiyonel)"
                    placeholder="1234567890"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.taxNumber?.message}
                    leftIcon="card-outline"
                    keyboardType="numeric"
                  />
                )}
              />
            </>
          )}

          <Button
            title="Üye Ol"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
          <Button
            title="Giriş Yap"
            onPress={navigateToLogin}
            variant="outline"
            style={styles.loginButton}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  loginButton: {
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

export default RegisterScreen;