from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'profile_image', 'loyalty_points', 'date_joined']
        read_only_fields = ['id', 'role', 'loyalty_points', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # Deliberately generic error for both "no such email" and "wrong password" —
        # avoids leaking which emails are registered (user enumeration).
        generic_error = "Invalid email or password."
        try:
            user = User.objects.get(email__iexact=attrs['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError(generic_error)

        authenticated_user = authenticate(username=user.username, password=attrs['password'])
        if authenticated_user is None:
            raise serializers.ValidationError(generic_error)

        attrs['user'] = authenticated_user
        return attrs
